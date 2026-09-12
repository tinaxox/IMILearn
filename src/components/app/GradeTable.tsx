import { gradeFromPct, type ExamAttempt, type ExamResult } from "@/lib/mock";
import { ScoreChip } from "./ScoreChip";
import { useTranslation } from "@/lib/i18n";

export function GradeTable({
  exams,
  results,
}: {
  exams: ExamAttempt[];
  results: ExamResult[];
}) {
  const { t } = useTranslation();
  const rows = exams.map((e) => {
    const r = results.find((x) => x.examId === e.id);
    return { exam: e, result: r };
  });
  const total = rows.reduce((acc, r) => acc + (r.result?.score ?? 0), 0);
  const max = rows.reduce((acc, r) => acc + (r.result?.maxScore ?? 0), 0);
  const pct = max > 0 ? (total / max) * 100 : 0;
  const fullyGraded = rows.length > 0 && rows.every((r) => !!r.result);
  const finalGrade = fullyGraded && max > 0 ? gradeFromPct(pct) : null;

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5">{t("gradeTable.exam")}</th>
            <th className="px-4 py-2.5 text-right">{t("gradeTable.points")}</th>
            <th className="px-4 py-2.5 text-right">{t("gradeTable.max")}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">{t("gradeTable.noExamsRecorded")}</td>
            </tr>
          )}
          {rows.map(({ exam, result }) => (
            <tr key={exam.id}>
              <td className="px-4 py-2.5">
                <div className="font-medium">{exam.name}</div>
              </td>
              <td className="px-4 py-2.5 text-right"><ScoreChip score={result?.score} max={result?.maxScore} /></td>
              <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">{result?.maxScore ?? "—"}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-muted/40 text-sm font-semibold">
          <tr>
            <td className="px-4 py-2.5">{t("gradeTable.total")}</td>
            <td className="px-4 py-2.5 text-right">{total}</td>
            <td className="px-4 py-2.5 text-right">{max}</td>
          </tr>
          <tr className="bg-black/[0.06]">
            <td className="px-4 py-3" colSpan={2}>{t("gradeTable.finalGrade")}</td>
            <td
              className="px-4 py-3 text-right text-lg font-bold"
              style={{ color: finalGrade === null ? undefined : finalGrade >= 6 ? "rgb(0,85,50)" : "rgb(150,0,43)" }}
            >
              {finalGrade ?? "—"}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
