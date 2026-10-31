import { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
} from 'lucide-react';
import { CHEAT_SHEET, FEATURED_VIVA, VIVA_GROUPS, VIVA_QUESTIONS } from '../generated/viva';
import { examActions, useExamState } from '../store';
import type { VivaQuestion } from '../types';
import { PageHead, SectionHead } from './PageHead';
import { BlockList, RichText } from './RichText';
import { Sheet } from './Sheet';
import { BTN_PRIMARY, BTN_QUIET, BTN_SECONDARY } from './ui';

type Filter = 'all' | 'featured' | 'again';

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function VivaScreen({
  openId,
  onOpen,
  onClose,
}: {
  openId: number | null;
  onOpen: (n: number) => void;
  onClose: () => void;
}) {
  const state = useExamState();
  const [filter, setFilter] = useState<Filter>('all');
  const [cheatOpen, setCheatOpen] = useState(false);
  const [quiz, setQuiz] = useState<{
    queue: number[];
    index: number;
    revealed: boolean;
    got: number;
    again: number;
  } | null>(null);

  const againCount = Object.values(state.vivaMarks).filter((mark) => mark === 'again').length;
  const getAnswer = (n: number) => VIVA_QUESTIONS.find((question) => question.n === n);
  const openQuestion = openId ? getAnswer(openId) ?? null : null;

  const matches = (question: VivaQuestion) => {
    if (filter === 'featured') return FEATURED_VIVA.includes(question.n);
    if (filter === 'again') return state.vivaMarks[String(question.n)] === 'again';
    return true;
  };

  const startQuiz = () => {
    const unmarked = VIVA_QUESTIONS.filter((question) => state.vivaMarks[String(question.n)] !== 'got').map(
      (question) => question.n
    );
    const pool = unmarked.length >= 5 ? unmarked : VIVA_QUESTIONS.map((question) => question.n);
    setQuiz({ queue: shuffle(pool).slice(0, 10), index: 0, revealed: false, got: 0, again: 0 });
  };

  const quizQuestion = quiz && quiz.index < quiz.queue.length ? getAnswer(quiz.queue[quiz.index]) : null;

  const finishQuizStep = (mark: 'got' | 'again' | 'skip') => {
    if (!quiz || !quizQuestion) return;
    if (mark !== 'skip') examActions.setVivaMark(quizQuestion.n, mark, false);
    setQuiz({
      ...quiz,
      index: quiz.index + 1,
      revealed: false,
      got: quiz.got + (mark === 'got' ? 1 : 0),
      again: quiz.again + (mark === 'again' ? 1 : 0),
    });
  };

  return (
    <div>
      <PageHead
        title="Thirty answers."
        lede="Name it, say what it does, give the lab example. Three sentences, then stop. If you do not know, say what you would check first."
      >
        <button type="button" onClick={startQuiz} className={BTN_PRIMARY}>
          <Shuffle size={15} aria-hidden="true" />
          Quiz me
        </button>
        <button type="button" onClick={() => setCheatOpen(true)} className={BTN_SECONDARY}>
          <BookOpen size={15} aria-hidden="true" />
          Quick revision table
        </button>
      </PageHead>

      <div className="mb-9 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-control border border-line bg-raised p-1" role="group" aria-label="Filter answers">
          {(
            [
              { id: 'all', label: `All ${VIVA_QUESTIONS.length}` },
              { id: 'featured', label: `Featured ${FEATURED_VIVA.length}` },
              { id: 'again', label: `To revisit ${againCount}` },
            ] as { id: Filter; label: string }[]
          ).map((option) => {
            const active = filter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setFilter(option.id)}
                aria-pressed={active}
                className={`min-h-9 rounded-[7px] px-3 text-sm transition-colors ${
                  active ? 'bg-brand-soft font-semibold text-brand-text' : 'font-medium text-ink-2 hover:text-ink'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-ink-3">
          {Object.keys(state.vivaMarks).length} of {VIVA_QUESTIONS.length} marked
        </p>
      </div>

      {filter === 'again' && againCount === 0 ? (
        <div className="rounded-card border border-line bg-raised p-6">
          <p className="text-[0.9375rem] text-ink-2">
            Nothing is marked for revision yet. Quiz yourself and mark the answers you fumble; they collect
            here.
          </p>
          <button type="button" onClick={startQuiz} className={`${BTN_PRIMARY} mt-4`}>
            <Shuffle size={15} aria-hidden="true" />
            Start a quiz
          </button>
        </div>
      ) : (
        <div className="space-y-10 sm:space-y-12">
          {VIVA_GROUPS.map((group) => {
            const questions = group.questions
              .map(getAnswer)
              .filter((question): question is VivaQuestion => question !== undefined && matches(question));
            if (questions.length === 0) return null;
            return (
              <section key={group.key} aria-labelledby={`viva-${group.key}`}>
                <SectionHead
                  id={`viva-${group.key}`}
                  title={group.title}
                  note={`${questions.length} ${questions.length === 1 ? 'answer' : 'answers'}`}
                />
                <ul className="border-t border-line">
                  {questions.map((question) => {
                    const mark = state.vivaMarks[String(question.n)];
                    return (
                      <li key={question.n} className="border-b border-line">
                        <button
                          type="button"
                          onClick={() => onOpen(question.n)}
                          className="group flex w-full items-start gap-3 py-3.5 text-left sm:gap-4"
                        >
                          <span className="mt-0.5 w-8 shrink-0 font-mono text-xs font-semibold text-ink-3 tnum">
                            Q{question.n}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[0.9375rem] leading-snug text-ink group-hover:text-brand-text">
                              {question.question}
                            </span>
                            <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                              {question.modelPaper ? <span className="text-brand-text">Model paper</span> : null}
                              {mark === 'got' ? <span className="text-success">Known</span> : null}
                              {mark === 'again' ? <span className="text-danger">Revisit</span> : null}
                            </span>
                          </span>
                          <ChevronRight
                            size={17}
                            className="mt-0.5 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-text"
                            aria-hidden="true"
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {openQuestion ? (
        <QuestionSheet
          question={openQuestion}
          onClose={onClose}
          onOpen={onOpen}
        />
      ) : null}

      {quiz ? (
        <Sheet
          open
          onClose={() => setQuiz(null)}
          title="Quiz"
          meta={
            quizQuestion ? (
              <>
                Question <span className="tnum">{quiz.index + 1}</span> of{' '}
                <span className="tnum">{quiz.queue.length}</span>
              </>
            ) : (
              'Complete'
            )
          }
        >
          {quizQuestion ? (
            <div>
              <p className="font-display text-[1.3rem] font-medium leading-snug text-ink">
                {quizQuestion.question}
              </p>
              {quiz.revealed ? (
                <div className="mt-5 space-y-4">
                  {quizQuestion.blocks.map((block, index) =>
                    block.type === 'p' ? (
                      <p key={index} className="text-[0.9375rem] leading-relaxed text-ink-2">
                        <RichText text={block.text} />
                      </p>
                    ) : (
                      <BlockList key={index} items={block.items} ordered={block.type === 'ol'} />
                    )
                  )}
                  {quizQuestion.trap ? (
                    <p className="rounded-card bg-danger-soft p-3.5 text-sm leading-relaxed text-ink-2">
                      <span className="font-semibold text-danger">Trap: </span>
                      <RichText text={quizQuestion.trap} />
                    </p>
                  ) : null}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => finishQuizStep('got')}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-success px-4 text-sm font-semibold text-canvas transition-opacity hover:opacity-90"
                    >
                      <Check size={16} aria-hidden="true" />
                      Got it
                    </button>
                    <button
                      type="button"
                      onClick={() => finishQuizStep('again')}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-danger/40 bg-danger-soft px-4 text-sm font-semibold text-danger transition-colors hover:border-danger"
                    >
                      <RotateCcw size={15} aria-hidden="true" />
                      Again
                    </button>
                  </div>
                  <button type="button" onClick={() => finishQuizStep('skip')} className={`${BTN_QUIET} w-full`}>
                    Skip for now
                  </button>
                </div>
              ) : (
                <div className="mt-6">
                  <p className="text-sm leading-relaxed text-ink-2">
                    Answer aloud before you reveal. Three sentences: name it, what it does, the lab example.
                  </p>
                  <button
                    type="button"
                    onClick={() => setQuiz({ ...quiz, revealed: true })}
                    className={`${BTN_PRIMARY} mt-4 w-full`}
                  >
                    Show answer
                  </button>
                  <button type="button" onClick={() => finishQuizStep('skip')} className={`${BTN_QUIET} mt-2 w-full`}>
                    Skip for now
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="font-display text-title font-semibold text-ink">
                {quiz.got} known · {quiz.again} to revisit
              </p>
              <p className="mt-2 text-[0.9375rem] text-ink-2">
                The answers you marked again are waiting under the “To revisit” filter.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={startQuiz} className={BTN_PRIMARY}>
                  <Shuffle size={15} aria-hidden="true" />
                  Another ten
                </button>
                <button type="button" onClick={() => setQuiz(null)} className={BTN_SECONDARY}>
                  Done
                </button>
              </div>
            </div>
          )}
        </Sheet>
      ) : null}

      {cheatOpen ? (
        <Sheet open onClose={() => setCheatOpen(false)} title="Quick revision table" size="wide">
          <ul className="border-t border-line">
            {CHEAT_SHEET.map((row) => (
              <li key={row.cells[0]} className="border-b border-line py-4">
                <h3 className="font-display text-[1.05rem] font-semibold text-ink">{row.cells[0]}</h3>
                <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-2">
                  <RichText text={row.cells[1]} />
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-3">
                  <span className="font-semibold text-ink-2">Lab proof:</span> <RichText text={row.cells[2]} />
                </p>
              </li>
            ))}
          </ul>
        </Sheet>
      ) : null}
    </div>
  );
}

function QuestionSheet({
  question,
  onClose,
  onOpen,
}: {
  question: VivaQuestion;
  onClose: () => void;
  onOpen: (n: number) => void;
}) {
  const state = useExamState();
  const mark = state.vivaMarks[String(question.n)];
  const index = VIVA_QUESTIONS.findIndex((item) => item.n === question.n);
  const previous = index > 0 ? VIVA_QUESTIONS[index - 1] : null;
  const next = index < VIVA_QUESTIONS.length - 1 ? VIVA_QUESTIONS[index + 1] : null;

  return (
    <Sheet
      open
      onClose={onClose}
      title={`Question ${question.n}`}
      meta={
        <>
          <span>{question.group}</span>
          {question.modelPaper ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-brand-text">Model paper</span>
            </>
          ) : null}
        </>
      }
      footer={
        <div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => examActions.setVivaMark(question.n, 'got')}
              aria-pressed={mark === 'got'}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 text-sm font-semibold transition-colors ${
                mark === 'got'
                  ? 'bg-success text-canvas'
                  : 'border border-line bg-raised text-ink hover:border-success/50 hover:text-success'
              }`}
            >
              <Check size={16} aria-hidden="true" />
              {mark === 'got' ? 'Known' : 'Got it'}
            </button>
            <button
              type="button"
              onClick={() => examActions.setVivaMark(question.n, 'again')}
              aria-pressed={mark === 'again'}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 text-sm font-semibold transition-colors ${
                mark === 'again'
                  ? 'bg-danger text-canvas'
                  : 'border border-line bg-raised text-ink hover:border-danger/50 hover:text-danger'
              }`}
            >
              <RotateCcw size={15} aria-hidden="true" />
              {mark === 'again' ? 'Revisit' : 'Again'}
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => previous && onOpen(previous.n)}
              disabled={!previous}
              className={`${BTN_QUIET} disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <ChevronLeft size={15} aria-hidden="true" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => next && onOpen(next.n)}
              disabled={!next}
              className={`${BTN_QUIET} disabled:cursor-not-allowed disabled:opacity-40`}
            >
              Next
              <ChevronRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      }
    >
      <p className="font-display text-[1.3rem] font-medium leading-snug text-ink">{question.question}</p>
      <div className="mt-5 space-y-4">
        {question.blocks.map((block, index) =>
          block.type === 'p' ? (
            <p key={index} className="text-[0.9375rem] leading-relaxed text-ink-2">
              <RichText text={block.text} />
            </p>
          ) : (
            <BlockList key={index} items={block.items} ordered={block.type === 'ol'} />
          )
        )}
      </div>
      {question.trap ? (
        <section className="mt-6 rounded-card bg-danger-soft p-4">
          <h3 className="mb-1.5 font-display text-[1.05rem] font-semibold text-danger">Trap</h3>
          <p className="text-[0.9375rem] leading-relaxed text-ink-2">
            <RichText text={question.trap} />
          </p>
        </section>
      ) : null}
      <p className="mt-6 flex items-center gap-1.5 text-xs text-ink-3">
        <ArrowRight size={13} aria-hidden="true" />
        Keep it to three sentences, then stop.
      </p>
    </Sheet>
  );
}
