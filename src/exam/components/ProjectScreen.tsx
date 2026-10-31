import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { CIE5_PARTS, PROJECT_EVIDENCE, PROJECT_SECTIONS } from '../content';
import { examActions, useExamState } from '../store';
import { PageHead, SectionHead } from './PageHead';
import { RichText } from './RichText';

function TwoColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="font-display text-[1.05rem] font-semibold text-ink">{title}</h3>
      <div className="mt-2 space-y-2 text-[0.9375rem] leading-relaxed text-ink-2">{children}</div>
    </div>
  );
}

export function ProjectScreen() {
  const state = useExamState();
  const written = PROJECT_SECTIONS.filter((section) => state.project.includes(section.id)).length;

  return (
    <div>
      <PageHead
        title="The CIE-5 work."
        lede="One document, ten sections, 20 marks. Build it from the machine in front of you and the numbers you measured on exam day; do not start from a blank page."
      >
        <p className="text-sm text-ink-3">
          <span className="font-semibold text-ink tnum">{written}</span> of{' '}
          <span className="font-semibold text-ink tnum">{PROJECT_SECTIONS.length}</span> sections written
        </p>
      </PageHead>

      <div className="space-y-12 sm:space-y-16">
        <section aria-labelledby="cie5-heading">
          <SectionHead id="cie5-heading" title="Where the CIE-5 marks sit" note="Internal assessment · 50 marks" />
          <dl className="border-t border-line">
            {CIE5_PARTS.map((part) => (
              <div key={part.label} className="grid gap-1 border-b border-line py-3 sm:grid-cols-[7rem_3rem_1fr] sm:gap-5">
                <dt className="text-[0.9375rem] font-medium text-ink">{part.label}</dt>
                <dd className="font-mono text-sm text-ink-2 tnum sm:text-right">{part.marks}</dd>
                <dd className="text-sm leading-relaxed text-ink-2">{part.note}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-ink-3">
            The practical exam is separate: 50 marks, 180 minutes, pass at 20. Its viva is Section 2 of the paper.
          </p>
        </section>

        <section aria-labelledby="document-heading">
          <SectionHead
            id="document-heading"
            title="The document"
            note={`${written} of ${PROJECT_SECTIONS.length} · tick what is written`}
          />
          <ul className="border-t border-line">
            {PROJECT_SECTIONS.map((section, index) => {
              const checked = state.project.includes(section.id);
              return (
                <li key={section.id} className="border-b border-line">
                  <label className="flex cursor-pointer items-start gap-3 py-3.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => examActions.toggleProject(section.id)}
                      className="mt-1 h-[18px] w-[18px] shrink-0 accent-[var(--brand)]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span className="font-mono text-xs font-semibold text-ink-3 tnum">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span
                          className={`text-[0.9375rem] font-medium ${
                            checked ? 'text-ink-3 line-through decoration-line-strong' : 'text-ink'
                          }`}
                        >
                          {section.title}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-ink-2">{section.detail}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="evidence-heading">
          <SectionHead
            id="evidence-heading"
            title="Evidence you already have"
            note="Use the numbers you measured"
          />
          <dl className="border-t border-line">
            {PROJECT_EVIDENCE.map((item) => (
              <div key={item.source} className="grid gap-1 border-b border-line py-3 sm:grid-cols-[12rem_1fr] sm:gap-5">
                <dt className="text-sm font-medium text-ink">{item.source}</dt>
                <dd className="text-sm leading-relaxed text-ink-2">
                  <RichText text={item.use} />
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="strong-heading">
          <SectionHead id="strong-heading" title="What makes it strong" />
          <div className="grid gap-6 sm:grid-cols-2">
            <TwoColumn title="Real numbers">
              <p>
                Start from the M73 baseline you can inspect: generic H81, LGA1150, i5 4th gen, 8 GB DDR3,
                240 GB SATA SSD + 500 GB HDD, HDMI, 450 W ATX supply. Then scale quantities and costs for the
                whole room.
              </p>
            </TwoColumn>
            <TwoColumn title="One consistent plan">
              <p>
                The network diagram, IP scheme, electrical load and Gantt chart must describe the same room.
                If the plan seats 30 students, the switch ports, outlets and load calculation must show 30.
              </p>
            </TwoColumn>
            <TwoColumn title="Dated and costed">
              <p>
                Every item in the procurement list gets a quantity, a unit price, a vendor and a date. The
                Gantt chart shows procurement, installation, testing and handover.
              </p>
            </TwoColumn>
            <TwoColumn title="Evidence, not prose">
              <p>
                Include photographs or screenshots from the exam-day work where they help: a labelled
                workstation, a partition table, an IP test table, a share opened between two PCs.
              </p>
            </TwoColumn>
          </div>
        </section>

        <section aria-labelledby="other-heading">
          <SectionHead id="other-heading" title="The other two CIE-5 parts" />
          <div className="grid gap-6 sm:grid-cols-2">
            <TwoColumn title="Portfolio · 10 marks">
              <p>
                The observation book, kept through the semester: every lab exercise recorded, corrections
                noted and signatures taken.
              </p>
              <p className="flex items-start gap-2 text-sm text-ink-3">
                <Check size={15} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
                Bring it to the viva; the examiner may ask for any exercise in it.
              </p>
            </TwoColumn>
            <TwoColumn title="Online course · 20 marks">
              <p>
                Ten hours or more in Linux administration, networking or cloud on an approved platform such
                as Infosys Springboard, Swayam, NPTEL or AWS.
              </p>
              <p className="flex items-start gap-2 text-sm text-ink-3">
                <Check size={15} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
                Keep the completion record. The certificate is the evidence.
              </p>
            </TwoColumn>
          </div>
        </section>
      </div>
    </div>
  );
}
