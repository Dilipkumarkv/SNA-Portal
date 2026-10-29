"""
Extracts the SNA curriculum from the source documents into a TypeScript data file.

Sources (expected in SNA_DOCS_DIR, default C:/Users/deep/Desktop/SNA):
  SNA_TeachingPlan.docx            -> 13 modules x 4 day-by-day lessons
  Laboratory_Manual SNA FV.pdf     -> 58 lab experiments
  SNA Syllabus.pdf                 -> weekly reference links

Output: src/data/curriculum.ts

Run:  python tools/extract_curriculum.py
"""

import html
import json
import os
import re
import sys
import zipfile
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError:
    sys.exit("pypdf is required:  python -m pip install pypdf")

PROJECT_DIR = Path(__file__).resolve().parent.parent
DOCS_DIR = Path(os.environ.get("SNA_DOCS_DIR", r"C:\Users\deep\Desktop\SNA"))
OUTPUT = PROJECT_DIR / "src" / "data" / "curriculum.ts"

TEACHING_PLAN = DOCS_DIR / "SNA_TeachingPlan.docx"
LAB_MANUAL = DOCS_DIR / "Laboratory_Manual SNA FV.pdf"
SYLLABUS = DOCS_DIR / "SNA Syllabus.pdf"


# --------------------------------------------------------------------------- helpers

def docx_paragraphs(path: Path):
    """Flatten a .docx into a list of paragraph strings, dropping empty ones."""
    with zipfile.ZipFile(path) as archive:
        xml = archive.read("word/document.xml").decode("utf8", "replace")
    xml = re.sub(r"</w:p>", "\n", xml)
    xml = re.sub(r"<w:tab[^>]*/>", "\t", xml)
    xml = re.sub(r"<[^>]+>", "", xml)
    return [line.strip() for line in xml.split("\n")]


def pdf_text(path: Path):
    reader = PdfReader(str(path))
    return [page.extract_text() or "" for page in reader.pages]


def clean(text: str) -> str:
    text = html.unescape(text)
    text = text.replace("\u2022", "* ").replace("\u2013", "-")
    text = text.replace("\u2019", "'").replace("\u201c", '"').replace("\u201d", '"')
    text = text.replace("\u2192", "->").replace("\u00a0", " ")
    text = text.replace("\t", " ")
    return re.sub(r"[ ]+", " ", text).strip()


def safe_slug(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or "item"


# ------------------------------------------------------------------- teaching plan

DAY_RE = re.compile(r"^Day\s+(\d)\s*:\s*(.+)$")
WEEK_RE = re.compile(r"^Week\s+(\d+)\s*:\s*(.+)$")
LAB_SESSION_RE = re.compile(r"^LAB SESSION\s*:\s*(?:Week\s*\d+\s*:\s*)?(.+)$")
VIVA_Q_RE = re.compile(r"^V(\d+)\s*\.\s*(.*)$")

# Heading words the teaching plan uses to open a block inside a lesson.
SECTION_HEADINGS = [
    "What", "Why", "How", "Common", "Key", "Tip", "Note", "Compare", "Comparison",
    "Difference", "Example", "Careful", "Caution", "Remember", "Do", "Don't",
    "Quick Revision", "CIE Question", "CIE-1 Expected Question Types",
    "Section A", "Section B", "Visit",
]
SECTION_RE = re.compile(
    r"^(" + "|".join(re.escape(h) for h in SECTION_HEADINGS) + r")\s*:\s*(.*)$",
    re.IGNORECASE,
)


def parse_teaching_plan(paragraphs):
    """Split the teaching plan into modules -> lessons with their body sections."""
    modules = []
    current_module = None
    current_lesson = None
    mode = None

    def flush_lesson():
        nonlocal current_lesson
        if current_lesson is not None and current_module is not None:
            current_module["lessons"].append(current_lesson)
        current_lesson = None

    def flush_module():
        nonlocal current_module
        flush_lesson()
        if current_module is not None:
            modules.append(current_module)
        current_module = None

    for raw in paragraphs:
        if "PAGEREF" in raw:
            continue

        line = clean(raw)
        if not line:
            continue

        lab_match = LAB_SESSION_RE.match(line)
        if lab_match:
            if current_module is not None:
                current_module["labTitle"] = clean(lab_match.group(1))
                mode = "lab"
            continue

        week_match = WEEK_RE.match(line)
        if week_match:
            flush_module()
            current_module = {
                "id": int(week_match.group(1)),
                "title": clean(week_match.group(2)),
                "previousSummary": "",
                "connection": "",
                "syllabusCoverage": [],
                "labTitle": "",
                "practicalTasks": [],
                "viva": [],
                "lessons": [],
            }
            mode = None
            continue

        day_match = DAY_RE.match(line)
        if day_match and current_module is not None:
            flush_lesson()
            current_lesson = {
                "number": int(day_match.group(1)),
                "title": clean(day_match.group(2)),
                "overview": "",
                "sections": [],
                "questions": [],
                "keyPoints": [],
            }
            mode = "overview"
            continue

        if current_module is None:
            continue

        if line.startswith("Practical Tasks"):
            flush_lesson()
            mode = "tasks"
            continue
        if line.startswith("Viva Questions"):
            flush_lesson()
            mode = "viva"
            continue

        if current_lesson is None:
            if line.startswith("Previous Unit Summary"):
                mode = "previousSummary"
                continue
            if line.startswith("Connection to This Unit"):
                mode = "connection"
                continue
            if line.startswith("Syllabus Coverage"):
                mode = "syllabus"
                continue
            if mode == "previousSummary":
                current_module["previousSummary"] = line
                mode = None
            elif mode == "connection":
                current_module["connection"] = line
                mode = None
            elif mode == "syllabus":
                current_module["syllabusCoverage"].append(line)
            elif mode == "tasks":
                topic, _, detail = line.partition(" \u2014 ")
                if not detail:
                    topic, _, detail = line.partition(" - ")
                current_module["practicalTasks"].append({
                    "topic": topic.strip(),
                    "detail": detail.strip(),
                })
            elif mode == "viva":
                question_match = VIVA_Q_RE.match(line)
                if question_match:
                    current_module["viva"].append({
                        "number": int(question_match.group(1)),
                        "question": clean(question_match.group(2)),
                        "answer": "",
                    })
                elif current_module["viva"]:
                    answer = re.sub(r"^Ans\s*[.:]?\s*", "", line)
                    current_module["viva"][-1]["answer"] = (
                        current_module["viva"][-1]["answer"] + " " + answer
                    ).strip()
            continue

        section_match = SECTION_RE.match(line)
        if section_match:
            heading = section_match.group(1).strip()
            body = clean(section_match.group(2))
            if heading.lower() == "cie question":
                current_lesson["questions"].append(body)
                continue
            if heading.lower() == "quick revision":
                current_lesson["keyPoints"].append(body)
                continue
            current_lesson["sections"].append({
                "heading": heading,
                "body": [body] if body else [],
            })
            mode = "section"
            continue

        if current_lesson["sections"]:
            current_lesson["sections"][-1]["body"].append(line)
        else:
            current_lesson["overview"] += (line + "\n")

    flush_module()
    return [m for m in modules if m["lessons"]]


# --------------------------------------------------------------------- lab manual

EXP_HEADER_RE = re.compile(r"^Experiment\s+(\d+)\s*[:.]?\s*(.*)$", re.IGNORECASE)


def parse_lab_manual(pages):
    """Pull every experiment's aim, components, procedure and result."""
    experiments = []
    current = None
    field = None

    for page in pages:
        for raw in page.split("\n"):
            line = clean(raw)
            if not line:
                continue

            header = EXP_HEADER_RE.match(line)
            if header and not line.lower().startswith("experiment" + header.group(1) + " "):
                if current:
                    experiments.append(current)
                current = {
                    "manualNumber": int(header.group(1)),
                    "title": clean(header.group(2)),
                    "aim": [],
                    "components": [],
                    "procedure": [],
                    "result": [],
                }
                field = None
                continue

            if current is None:
                continue

            lowered = line.lower().rstrip(":")
            if lowered in ("aim", "objective"):
                field = "aim"
                continue
            if lowered.startswith("components"):
                field = "components"
                continue
            if lowered.startswith("procedure"):
                field = "procedure"
                continue
            if lowered.startswith("result"):
                field = "result"
                continue

            if field is None:
                continue

            entry = line[2:].strip() if line.startswith("* ") else line
            entry = re.sub(r"^\d+[.)]\s*", "", entry)

            if field == "components" and not entry.startswith("*"):
                entry = "* " + entry

            current[field].append(entry)

    if current:
        experiments.append(current)

    for experiment in experiments:
        experiment["aim"] = " ".join(experiment["aim"]).strip()
        experiment["result"] = " ".join(experiment["result"]).strip()
        experiment["components"] = [c[2:] if c.startswith("* ") else c for c in experiment["components"]]
        experiment["procedure"] = [p for p in experiment["procedure"] if p]

    experiments.sort(key=lambda e: e["manualNumber"])
    for index, experiment in enumerate(experiments, start=1):
        experiment["id"] = index

    return experiments


# The manual prints its own experiment numbers and skips 18/19, and repeats 47.
# Mapping below is by printed number -> teaching week, derived from the topic of
# each experiment against the week's Practical Tasks in the teaching plan.
EXPERIMENT_WEEKS = {
    1: 1, 2: 1, 3: 1,
    4: 2, 5: 2, 6: 2, 7: 2,
    8: 3, 9: 3, 10: 3, 11: 3, 12: 3,
    13: 4,
    14: 5, 15: 5, 16: 5, 17: 5,
    23: 6,
    26: 7, 30: 7,
    20: 8, 21: 8, 22: 8, 24: 8, 25: 8,
    27: 9, 28: 9, 29: 9, 31: 9, 32: 9, 33: 9, 34: 9, 35: 9, 36: 9,
    37: 10, 38: 10, 39: 10, 40: 10, 41: 10, 42: 10, 43: 10, 44: 10, 45: 10, 46: 10,
    47: 10,
    48: 11, 49: 11, 50: 11, 51: 11, 52: 11, 53: 11, 54: 11,
    55: 12, 56: 12, 57: 12, 58: 12, 59: 12,
}


def assign_experiment_weeks(experiments):
    """Give every experiment its teaching week and a unique id."""
    used = set()
    for experiment in experiments:
        number = experiment["manualNumber"]
        week = EXPERIMENT_WEEKS.get(number)
        if week is None:
            continue
        experiment["week"] = week
        used.add(number)

    # The manual prints "Experiment 47" twice: the second one is network
    # monitoring, which belongs to the networking module rather than week 10.
    duplicates = [e for e in experiments if e["manualNumber"] == 47]
    if len(duplicates) > 1:
        for experiment in duplicates[1:]:
            experiment["week"] = 11

    for index, experiment in enumerate(experiments, start=1):
        experiment.setdefault("id", index)

    unmapped = [e["manualNumber"] for e in experiments if "week" not in e]
    if unmapped:
        sys.exit(f"Unmapped experiments (printed numbers): {unmapped}")

    return experiments


# ----------------------------------------------------------------------- syllabus

def parse_syllabus_references(pages):
    """Pull the weekly reference links out of the syllabus references table.

    The table spans two pages and shares them with other content, so the region
    is bounded first: from the 'Week Description' header to the start of the
    CIE assessment section.
    """
    blob = "\n".join(pages)

    start = blob.find("Week Description")
    end = blob.find("5. CIE Assessment Methodologies")
    if start == -1 or end == -1 or end < start:
        sys.exit("Could not locate the syllabus references table")

    region = blob[start + len("Week Description"):end]

    buckets = {}
    current = None

    for raw in region.split("\n"):
        line = raw.strip()
        if not line:
            continue
        marker = re.match(r"^(\d{2})\s", line)
        if marker and 1 <= int(marker.group(1)) <= 13:
            current = int(marker.group(1))
            buckets.setdefault(current, []).append(line)
            continue
        if current is not None:
            buckets[current].append(line)

    per_week = {}
    for week, lines in buckets.items():
        joined = " ".join(lines)
        urls = ["http" + token.replace(" ", "") for token in joined.split("http")[1:]]
        per_week[week] = [url.rstrip(".,;)") for url in urls]

    return per_week


# -------------------------------------------------------------------------- output

def ts_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def ts_list(values, indent="  "):
    if not values:
        return "[]"
    lines = [f"{indent}  {ts_string(v)}," for v in values]
    return "[\n" + "\n".join(lines) + f"\n{indent}]"


def build_typescript(modules, experiments, week_links):
    out = []
    out.append("// AUTO-GENERATED by tools/extract_curriculum.py - do not edit by hand.")
    out.append("// Sources: SNA_TeachingPlan.docx, Laboratory_Manual SNA FV.pdf, SNA Syllabus.pdf")
    out.append("")

    out.append("export interface LessonSection {")
    out.append("  heading: string;")
    out.append("  body: string[];")
    out.append("}")
    out.append("")
    out.append("export interface Lesson {")
    out.append("  number: number;")
    out.append("  title: string;")
    out.append("  overview: string;")
    out.append("  sections: LessonSection[];")
    out.append("  questions: string[];")
    out.append("  keyPoints: string[];")
    out.append("}")
    out.append("")
    out.append("export interface PracticalTask {")
    out.append("  topic: string;")
    out.append("  detail: string;")
    out.append("}")
    out.append("")
    out.append("export interface VivaQuestion {")
    out.append("  number: number;")
    out.append("  question: string;")
    out.append("  answer: string;")
    out.append("}")
    out.append("")
    out.append("export interface Experiment {")
    out.append("  id: number;")
    out.append("  manualNumber: number;")
    out.append("  week: number;")
    out.append("  title: string;")
    out.append("  aim: string;")
    out.append("  components: string[];")
    out.append("  procedure: string[];")
    out.append("  result: string;")
    out.append("}")
    out.append("")
    out.append("export interface Reference {")
    out.append("  label: string;")
    out.append("  url: string;")
    out.append("}")
    out.append("")
    out.append("export interface Module {")
    out.append("  id: number;")
    out.append("  title: string;")
    out.append("  previousSummary: string;")
    out.append("  connection: string;")
    out.append("  syllabusCoverage: string[];")
    out.append("  labTitle: string;")
    out.append("  practicalTasks: PracticalTask[];")
    out.append("  viva: VivaQuestion[];")
    out.append("  lessons: Lesson[];")
    out.append("  experimentIds: number[];")
    out.append("  references: Reference[];")
    out.append("}")
    out.append("")

    out.append("export const CURRICULUM: Module[] = [")
    for module in modules:
        out.append("  {")
        out.append(f"    id: {module['id']},")
        out.append(f"    title: {ts_string(module['title'])},")
        out.append(f"    previousSummary: {ts_string(module['previousSummary'])},")
        out.append(f"    connection: {ts_string(module['connection'])},")
        out.append(f"    syllabusCoverage: {ts_list(module['syllabusCoverage'], '    ')},")
        out.append(f"    labTitle: {ts_string(module['labTitle'])},")
        out.append("    practicalTasks: [")
        for task in module["practicalTasks"]:
            out.append(f"      {{ topic: {ts_string(task['topic'])}, detail: {ts_string(task['detail'])} }},")
        out.append("    ],")
        out.append("    viva: [")
        for viva in module["viva"]:
            out.append(
                f"      {{ number: {viva['number']}, question: {ts_string(viva['question'])},"
                f" answer: {ts_string(viva['answer'])} }},"
            )
        out.append("    ],")
        out.append(
            "    experimentIds: "
            + json.dumps([e["id"] for e in experiments if e["week"] == module["id"]])
            + ","
        )
        out.append("    references: [")
        for url in week_links.get(module["id"], []):
            label = url.split("//", 1)[-1].split("/")[0]
            out.append(f"      {{ label: {ts_string(label)}, url: {ts_string(url)} }},")
        out.append("    ],")
        out.append("    lessons: [")
        for lesson in module["lessons"]:
            out.append("      {")
            out.append(f"        number: {lesson['number']},")
            out.append(f"        title: {ts_string(lesson['title'])},")
            out.append(f"        overview: {ts_string(lesson['overview'])},")
            out.append("        sections: [")
            for section in lesson["sections"]:
                out.append("          {")
                out.append(f"            heading: {ts_string(section['heading'])},")
                out.append(f"            body: {ts_list(section['body'], '            ')},")
                out.append("          },")
            out.append("        ],")
            out.append(f"        questions: {ts_list(lesson['questions'], '        ')},")
            out.append(f"        keyPoints: {ts_list(lesson['keyPoints'], '        ')},")
            out.append("      },")
        out.append("    ],")
        out.append("  },")
    out.append("];")
    out.append("")

    out.append("export const EXPERIMENTS: Experiment[] = [")
    for experiment in experiments:
        out.append("  {")
        out.append(f"    id: {experiment['id']},")
        out.append(f"    manualNumber: {experiment['manualNumber']},")
        out.append(f"    week: {experiment['week']},")
        out.append(f"    title: {ts_string(experiment['title'])},")
        out.append(f"    aim: {ts_string(experiment['aim'])},")
        out.append(f"    components: {ts_list(experiment['components'], '    ')},")
        out.append(f"    procedure: {ts_list(experiment['procedure'], '    ')},")
        out.append(f"    result: {ts_string(experiment['result'])},")
        out.append("  },")
    out.append("];")
    out.append("")
    return "\n".join(out)


def main():
    for path in (TEACHING_PLAN, LAB_MANUAL, SYLLABUS):
        if not path.exists():
            sys.exit(f"Missing source document: {path}")

    print(f"Reading teaching plan  : {TEACHING_PLAN.name}")
    modules = parse_teaching_plan(docx_paragraphs(TEACHING_PLAN))
    print(f"  -> {len(modules)} modules, {sum(len(m['lessons']) for m in modules)} lessons")

    print(f"Reading lab manual     : {LAB_MANUAL.name}")
    experiments = assign_experiment_weeks(parse_lab_manual(pdf_text(LAB_MANUAL)))
    print(f"  -> {len(experiments)} experiments")

    print(f"Reading syllabus       : {SYLLABUS.name}")
    week_links = parse_syllabus_references(pdf_text(SYLLABUS))
    print(f"  -> {sum(len(v) for v in week_links.values())} reference links "
          f"across {len(week_links)} weeks")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        build_typescript(modules, experiments, week_links),
        encoding="utf-8",
        newline="\n",
    )
    print(f"\nWrote {OUTPUT.relative_to(PROJECT_DIR)}")

    for module in modules:
        count = sum(1 for e in experiments if e["week"] == module["id"])
        links = len(week_links.get(module["id"], []))
        print(
            f"  W{module['id']:02d}  lessons={len(module['lessons'])}"
            f"  tasks={len(module['practicalTasks'])}"
            f"  viva={len(module['viva'])}"
            f"  experiments={count}"
            f"  links={links}"
        )


if __name__ == "__main__":
    main()
