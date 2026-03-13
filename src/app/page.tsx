"use client";

import { useEffect, useMemo, useState } from "react";

type Household = {
  id: string;
  name: string;
  createdAt: number;
};

type WorshipRecord = {
  householdId: string;
  date: string;
  checked: boolean;
  note: string;
  updatedAt: number;
};

type SavedState = {
  households: Household[];
  records: WorshipRecord[];
};

type MonitoringRow = {
  household: Household;
  lastDate: string | null;
  weekCount: number;
  monthCount: number;
  isDoneThisWeek: boolean;
};

type TrendPoint = {
  weekLabel: string;
  participationRate: number;
  completedHouseholds: number;
  worshipCount: number;
};

const STORAGE_KEY = "sapc-family-worship-v1";
const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
  }).format(date);
}

function startOfWeekMonday(date: Date): Date {
  const result = new Date(date);
  const diff = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function getWeekKeys(date: Date): string[] {
  const start = startOfWeekMonday(date);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return toDateKey(day);
  });
}

function getCalendarDays(monthCursor: Date): Date[] {
  const firstDayOfMonth = new Date(
    monthCursor.getFullYear(),
    monthCursor.getMonth(),
    1
  );
  const startDay = new Date(firstDayOfMonth);
  startDay.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(startDay);
    day.setDate(startDay.getDate() + index);
    return day;
  });
}

function getRecordKey(householdId: string, dateKey: string): string {
  return `${householdId}::${dateKey}`;
}

function isDateKeyBetween(
  dateKey: string,
  startDateKey: string,
  endDateKey: string
): boolean {
  return dateKey >= startDateKey && dateKey <= endDateKey;
}

export default function Home() {
  const today = useMemo(() => new Date(), []);
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey(today));
  const [monthCursor, setMonthCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [households, setHouseholds] = useState<Household[]>([]);
  const [records, setRecords] = useState<WorshipRecord[]>([]);
  const [newHouseholdName, setNewHouseholdName] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedState;
        const nextHouseholds = Array.isArray(parsed.households)
          ? parsed.households
          : [];
        const nextRecords = Array.isArray(parsed.records) ? parsed.records : [];
        setHouseholds(nextHouseholds);
        setRecords(nextRecords);
      } else {
        setHouseholds([
          { id: crypto.randomUUID(), name: "1가정", createdAt: Date.now() },
        ]);
      }
    } catch {
      setHouseholds([{ id: crypto.randomUUID(), name: "1가정", createdAt: Date.now() }]);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const payload: SavedState = { households, records };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [households, records, isHydrated]);

  const checkedRecords = useMemo(
    () => records.filter((record) => record.checked),
    [records]
  );

  const recordsByKey = useMemo(() => {
    return new Map(
      records.map((record) => [getRecordKey(record.householdId, record.date), record])
    );
  }, [records]);

  const householdNameMap = useMemo(() => {
    return new Map(households.map((household) => [household.id, household.name]));
  }, [households]);

  const dayCheckedCountMap = useMemo(() => {
    const countMap = new Map<string, number>();
    checkedRecords.forEach((record) => {
      countMap.set(record.date, (countMap.get(record.date) ?? 0) + 1);
    });
    return countMap;
  }, [checkedRecords]);

  const selectedDate = useMemo(() => parseDateKey(selectedDateKey), [selectedDateKey]);
  const weekKeys = useMemo(() => getWeekKeys(selectedDate), [selectedDate]);
  const weekKeySet = useMemo(() => new Set(weekKeys), [weekKeys]);
  const calendarDays = useMemo(() => getCalendarDays(monthCursor), [monthCursor]);

  const currentWeekKeys = useMemo(() => getWeekKeys(today), [today]);
  const currentWeekKeySet = useMemo(() => new Set(currentWeekKeys), [currentWeekKeys]);

  const monthStart = useMemo(
    () => new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1),
    [monthCursor]
  );
  const monthEnd = useMemo(
    () => new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0),
    [monthCursor]
  );
  const monthStartKey = useMemo(() => toDateKey(monthStart), [monthStart]);
  const monthEndKey = useMemo(() => toDateKey(monthEnd), [monthEnd]);

  const recentThirtyStart = useMemo(() => addDays(today, -29), [today]);
  const recentThirtyStartKey = useMemo(
    () => toDateKey(recentThirtyStart),
    [recentThirtyStart]
  );

  const weeklySummary = useMemo(() => {
    const summaryRows = households.map((household) => {
      const doneDates = new Set(
        checkedRecords
          .filter(
            (record) =>
              record.householdId === household.id && weekKeySet.has(record.date)
          )
          .map((record) => record.date)
      );

      return {
        household,
        doneDays: doneDates.size,
        isDoneThisWeek: doneDates.size > 0,
      };
    });

    const finishedCount = summaryRows.filter((row) => row.isDoneThisWeek).length;
    const participationRate =
      households.length === 0 ? 0 : Math.round((finishedCount / households.length) * 100);

    return { summaryRows, participationRate, finishedCount };
  }, [households, checkedRecords, weekKeySet]);

  const dashboardStats = useMemo(() => {
    const currentWeekHouseholds = new Set(
      checkedRecords
        .filter((record) => currentWeekKeySet.has(record.date))
        .map((record) => record.householdId)
    );
    const currentWeekWorshipCount = checkedRecords.filter((record) =>
      currentWeekKeySet.has(record.date)
    ).length;
    const currentMonthWorshipCount = checkedRecords.filter((record) =>
      isDateKeyBetween(record.date, monthStartKey, monthEndKey)
    ).length;
    const recentThirtyCount = checkedRecords.filter((record) =>
      isDateKeyBetween(record.date, recentThirtyStartKey, toDateKey(today))
    ).length;

    return {
      householdCount: households.length,
      weekActiveHouseholds: currentWeekHouseholds.size,
      currentWeekWorshipCount,
      currentMonthWorshipCount,
      recentThirtyCount,
      currentWeekParticipation:
        households.length === 0
          ? 0
          : Math.round((currentWeekHouseholds.size / households.length) * 100),
    };
  }, [
    checkedRecords,
    currentWeekKeySet,
    households.length,
    monthEndKey,
    monthStartKey,
    recentThirtyStartKey,
    today,
  ]);

  const weeklyTrend = useMemo<TrendPoint[]>(() => {
    const currentWeekStart = startOfWeekMonday(today);

    return Array.from({ length: 8 }, (_, index) => {
      const weekOffset = 7 - index;
      const targetWeekStart = addDays(currentWeekStart, -7 * weekOffset);
      const targetWeekKeys = getWeekKeys(targetWeekStart);
      const targetWeekSet = new Set(targetWeekKeys);

      const householdsDone = new Set(
        checkedRecords
          .filter((record) => targetWeekSet.has(record.date))
          .map((record) => record.householdId)
      );
      const worshipCount = checkedRecords.filter((record) =>
        targetWeekSet.has(record.date)
      ).length;

      return {
        weekLabel: `${targetWeekKeys[0].slice(5)}~${targetWeekKeys[6].slice(5)}`,
        participationRate:
          households.length === 0
            ? 0
            : Math.round((householdsDone.size / households.length) * 100),
        completedHouseholds: householdsDone.size,
        worshipCount,
      };
    });
  }, [checkedRecords, households.length, today]);

  const monitoringRows = useMemo<MonitoringRow[]>(() => {
    const rows = households.map((household) => {
      const householdChecked = checkedRecords.filter(
        (record) => record.householdId === household.id
      );

      const latestRecord = householdChecked.reduce<WorshipRecord | null>((latest, record) => {
        if (!latest) {
          return record;
        }
        if (record.date > latest.date) {
          return record;
        }
        if (record.date === latest.date && record.updatedAt > latest.updatedAt) {
          return record;
        }
        return latest;
      }, null);

      const weekCount = householdChecked.filter((record) =>
        currentWeekKeySet.has(record.date)
      ).length;
      const monthCount = householdChecked.filter((record) =>
        isDateKeyBetween(record.date, monthStartKey, monthEndKey)
      ).length;

      return {
        household,
        lastDate: latestRecord?.date ?? null,
        weekCount,
        monthCount,
        isDoneThisWeek: weekCount > 0,
      };
    });

    return rows.sort((a, b) => {
      if (b.monthCount !== a.monthCount) {
        return b.monthCount - a.monthCount;
      }
      if (b.weekCount !== a.weekCount) {
        return b.weekCount - a.weekCount;
      }
      return a.household.name.localeCompare(b.household.name, "ko");
    });
  }, [households, checkedRecords, currentWeekKeySet, monthStartKey, monthEndKey]);

  const recentNotes = useMemo(() => {
    return [...checkedRecords]
      .filter((record) => record.note.trim().length > 0)
      .sort((a, b) => {
        if (b.date !== a.date) {
          return b.date.localeCompare(a.date);
        }
        return b.updatedAt - a.updatedAt;
      })
      .slice(0, 10);
  }, [checkedRecords]);

  const maxMonthlyCount = useMemo(() => {
    return Math.max(
      1,
      ...monitoringRows.map((row) => row.monthCount)
    );
  }, [monitoringRows]);

  function handleAddHousehold(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = newHouseholdName.trim();
    if (!trimmedName) {
      return;
    }

    setHouseholds((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: trimmedName, createdAt: Date.now() },
    ]);
    setNewHouseholdName("");
  }

  function handleDeleteHousehold(householdId: string) {
    setHouseholds((prev) => prev.filter((household) => household.id !== householdId));
    setRecords((prev) => prev.filter((record) => record.householdId !== householdId));
  }

  function updateRecord(
    householdId: string,
    dateKey: string,
    patch: Partial<Pick<WorshipRecord, "checked" | "note">>
  ) {
    setRecords((prev) => {
      const index = prev.findIndex(
        (record) => record.householdId === householdId && record.date === dateKey
      );
      const current = index >= 0 ? prev[index] : null;
      const next: WorshipRecord = {
        householdId,
        date: dateKey,
        checked: patch.checked ?? current?.checked ?? false,
        note: patch.note ?? current?.note ?? "",
        updatedAt: Date.now(),
      };

      if (!next.checked && !next.note.trim()) {
        if (index < 0) {
          return prev;
        }
        return prev.filter((_, i) => i !== index);
      }

      if (index < 0) {
        return [...prev, next];
      }

      return prev.map((record, i) => (i === index ? next : record));
    });
  }

  function goToPreviousMonth() {
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
      <section className="card-surface flex flex-col gap-3 p-6">
        <p className="text-sm font-semibold tracking-[0.2em] text-[var(--color-accent-strong)]">
          사랑과평안의교회
        </p>
        <h1 className="font-title text-3xl text-[var(--color-ink)] md:text-4xl">
          가정예배 주단위 실시 현황 체크앱
        </h1>
        <p className="max-w-4xl text-sm leading-7 text-[var(--color-ink-soft)] md:text-base">
          각 가정의 예배 실시일과 내용을 한 화면에서 정리합니다. 날짜를 누르고,
          가정별로 체크와 메모를 입력하면 자동으로 주간 참여 현황과 모니터링 대시보드가 집계됩니다.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_1.5fr_1.4fr]">
        <article className="card-surface flex flex-col gap-4 p-5">
          <h2 className="font-title text-2xl text-[var(--color-ink)]">가정 관리</h2>
          <form className="flex gap-2" onSubmit={handleAddHousehold}>
            <input
              type="text"
              placeholder="예: 2가정"
              value={newHouseholdName}
              onChange={(event) => setNewHouseholdName(event.target.value)}
              className="w-full rounded-xl border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-[var(--color-accent)]"
            />
            <button
              type="submit"
              className="rounded-xl bg-[var(--color-accent-strong)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            >
              추가
            </button>
          </form>

          <div className="space-y-2">
            {households.length === 0 ? (
              <p className="rounded-xl bg-[var(--color-sky)] px-3 py-2 text-sm text-[var(--color-ink-soft)]">
                먼저 가정을 추가해 주세요.
              </p>
            ) : (
              households.map((household) => (
                <div
                  key={household.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--color-line)] bg-white px-3 py-2"
                >
                  <span className="text-sm font-medium text-[var(--color-ink)]">
                    {household.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteHousehold(household.id)}
                    className="rounded-md px-2 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    삭제
                  </button>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="card-surface flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-title text-2xl text-[var(--color-ink)]">
              {formatMonth(monthCursor)}
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="rounded-lg border border-[var(--color-line)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--color-ink-soft)] transition hover:border-[var(--color-accent)]"
              >
                이전
              </button>
              <button
                type="button"
                onClick={goToNextMonth}
                className="rounded-lg border border-[var(--color-line)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--color-ink-soft)] transition hover:border-[var(--color-accent)]"
              >
                다음
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {DAY_LABELS.map((dayLabel) => (
              <div
                key={dayLabel}
                className="pb-1 text-center text-xs font-semibold text-[var(--color-ink-soft)]"
              >
                {dayLabel}
              </div>
            ))}
            {calendarDays.map((day) => {
              const dayKey = toDateKey(day);
              const isCurrentMonth = day.getMonth() === monthCursor.getMonth();
              const isSelected = dayKey === selectedDateKey;
              const checkedCount = dayCheckedCountMap.get(dayKey) ?? 0;

              return (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => setSelectedDateKey(dayKey)}
                  className={`relative min-h-20 rounded-xl border px-2 py-2 text-left transition ${
                    isSelected
                      ? "border-[var(--color-accent-strong)] bg-[var(--color-accent-soft)]"
                      : "border-[var(--color-line)] bg-white hover:border-[var(--color-accent)]"
                  } ${isCurrentMonth ? "" : "opacity-45"}`}
                >
                  <p className="text-sm font-semibold text-[var(--color-ink)]">
                    {day.getDate()}
                  </p>
                  {checkedCount > 0 && (
                    <span className="absolute bottom-2 right-2 rounded-full bg-[var(--color-accent-strong)] px-2 py-0.5 text-[10px] font-semibold text-white">
                      {checkedCount}가정
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </article>

        <article className="card-surface flex flex-col gap-4 p-5">
          <div className="rounded-2xl bg-[var(--color-sky)] p-4">
            <p className="text-xs font-semibold text-[var(--color-ink-soft)]">선택 날짜</p>
            <p className="mt-1 text-lg font-semibold text-[var(--color-ink)]">
              {formatDate(selectedDate)}
            </p>
          </div>

          <h2 className="font-title text-2xl text-[var(--color-ink)]">예배 기록</h2>
          <div className="max-h-[420px] space-y-3 overflow-auto pr-1">
            {households.length === 0 && (
              <p className="rounded-xl bg-[var(--color-sky)] px-3 py-2 text-sm text-[var(--color-ink-soft)]">
                가정을 추가하면 이곳에서 체크할 수 있습니다.
              </p>
            )}
            {households.map((household) => {
              const key = getRecordKey(household.id, selectedDateKey);
              const record = recordsByKey.get(key);

              return (
                <div
                  key={household.id}
                  className="rounded-2xl border border-[var(--color-line)] bg-white p-3"
                >
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                    <input
                      type="checkbox"
                      checked={record?.checked ?? false}
                      onChange={(event) =>
                        updateRecord(household.id, selectedDateKey, {
                          checked: event.target.checked,
                        })
                      }
                      className="h-4 w-4 accent-[var(--color-accent-strong)]"
                    />
                    {household.name} 예배 실시
                  </label>
                  <textarea
                    value={record?.note ?? ""}
                    onChange={(event) =>
                      updateRecord(household.id, selectedDateKey, {
                        note: event.target.value,
                      })
                    }
                    placeholder="예: 찬양 2곡, 말씀 나눔(시편 23편), 가족 기도"
                    className="h-20 w-full resize-none rounded-xl border border-[var(--color-line)] px-3 py-2 text-sm outline-none transition focus:border-[var(--color-accent)]"
                  />
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="card-surface p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-title text-2xl text-[var(--color-ink)]">
              주간 참여 현황 (월~주)
            </h2>
            <p className="text-sm text-[var(--color-ink-soft)]">
              {weekKeys[0]} ~ {weekKeys[6]}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--color-sky)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]">
            참여율 {weeklySummary.participationRate}% (
            {weeklySummary.finishedCount}/{households.length || 0}가정)
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] table-fixed border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left">
                <th className="px-2 py-2 text-sm font-semibold text-[var(--color-ink-soft)]">
                  가정
                </th>
                <th className="px-2 py-2 text-sm font-semibold text-[var(--color-ink-soft)]">
                  주간 실시일 수
                </th>
                <th className="px-2 py-2 text-sm font-semibold text-[var(--color-ink-soft)]">
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {weeklySummary.summaryRows.map((row) => (
                <tr key={row.household.id} className="border-b border-[var(--color-line)]">
                  <td className="px-2 py-2 text-sm text-[var(--color-ink)]">
                    {row.household.name}
                  </td>
                  <td className="px-2 py-2 text-sm text-[var(--color-ink)]">
                    {row.doneDays}일
                  </td>
                  <td className="px-2 py-2 text-sm">
                    {row.isDoneThisWeek ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                        실시 완료
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                        미실시
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {weeklySummary.summaryRows.length === 0 && (
                <tr>
                  <td className="px-2 py-4 text-sm text-[var(--color-ink-soft)]" colSpan={3}>
                    가정을 먼저 등록하면 주간 현황이 표시됩니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-surface p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-title text-2xl text-[var(--color-ink)]">모니터링 대시보드</h2>
            <p className="text-sm text-[var(--color-ink-soft)]">
              오늘 기준 실시간 집계 · {currentWeekKeys[0]} ~ {currentWeekKeys[6]}
            </p>
          </div>
          <p className="text-xs text-[var(--color-ink-soft)]">
            저장 위치: 브라우저 로컬 저장소(localStorage)
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4">
            <p className="text-xs font-semibold text-[var(--color-ink-soft)]">등록 가정 수</p>
            <p className="mt-2 text-2xl font-bold text-[var(--color-ink)]">
              {dashboardStats.householdCount}가정
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4">
            <p className="text-xs font-semibold text-[var(--color-ink-soft)]">이번 주 참여율</p>
            <p className="mt-2 text-2xl font-bold text-[var(--color-ink)]">
              {dashboardStats.currentWeekParticipation}%
            </p>
            <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
              {dashboardStats.weekActiveHouseholds}/{dashboardStats.householdCount || 0}가정 참여
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4">
            <p className="text-xs font-semibold text-[var(--color-ink-soft)]">이번 주 예배 기록</p>
            <p className="mt-2 text-2xl font-bold text-[var(--color-ink)]">
              {dashboardStats.currentWeekWorshipCount}건
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4">
            <p className="text-xs font-semibold text-[var(--color-ink-soft)]">최근 30일 기록</p>
            <p className="mt-2 text-2xl font-bold text-[var(--color-ink)]">
              {dashboardStats.recentThirtyCount}건
            </p>
            <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
              {formatMonth(monthCursor)} 기록 {dashboardStats.currentMonthWorshipCount}건
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_1fr]">
          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4">
            <h3 className="text-base font-semibold text-[var(--color-ink)]">최근 8주 참여 추이</h3>
            <div className="mt-3 space-y-2">
              {weeklyTrend.map((point) => (
                <div key={point.weekLabel}>
                  <div className="mb-1 flex items-center justify-between text-xs text-[var(--color-ink-soft)]">
                    <span>{point.weekLabel}</span>
                    <span>
                      참여 {point.completedHouseholds}가정 · {point.worshipCount}건
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-sky)]">
                    <div
                      className="h-2 rounded-full bg-[var(--color-accent-strong)]"
                      style={{ width: `${point.participationRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4">
            <h3 className="text-base font-semibold text-[var(--color-ink)]">최근 예배 메모</h3>
            <div className="mt-3 space-y-2">
              {recentNotes.length === 0 && (
                <p className="rounded-xl bg-[var(--color-sky)] px-3 py-2 text-sm text-[var(--color-ink-soft)]">
                  메모가 있는 기록이 아직 없습니다.
                </p>
              )}
              {recentNotes.map((record) => (
                <div
                  key={`${record.householdId}-${record.date}-${record.updatedAt}`}
                  className="rounded-xl border border-[var(--color-line)] p-3"
                >
                  <p className="text-xs text-[var(--color-ink-soft)]">
                    {record.date} · {householdNameMap.get(record.householdId) ?? "알 수 없는 가정"}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-ink)]">{record.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] table-fixed border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left">
                <th className="px-2 py-2 text-sm font-semibold text-[var(--color-ink-soft)]">
                  가정
                </th>
                <th className="px-2 py-2 text-sm font-semibold text-[var(--color-ink-soft)]">
                  최근 예배일
                </th>
                <th className="px-2 py-2 text-sm font-semibold text-[var(--color-ink-soft)]">
                  이번 주
                </th>
                <th className="px-2 py-2 text-sm font-semibold text-[var(--color-ink-soft)]">
                  이번 달 실적
                </th>
                <th className="px-2 py-2 text-sm font-semibold text-[var(--color-ink-soft)]">
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {monitoringRows.map((row) => {
                const monthPercent = Math.round((row.monthCount / maxMonthlyCount) * 100);

                return (
                  <tr key={row.household.id} className="border-b border-[var(--color-line)]">
                    <td className="px-2 py-2 text-sm text-[var(--color-ink)]">
                      {row.household.name}
                    </td>
                    <td className="px-2 py-2 text-sm text-[var(--color-ink)]">
                      {row.lastDate ?? "기록 없음"}
                    </td>
                    <td className="px-2 py-2 text-sm text-[var(--color-ink)]">
                      {row.weekCount}회
                    </td>
                    <td className="px-2 py-2 text-sm text-[var(--color-ink)]">
                      <div className="flex items-center gap-2">
                        <span className="w-10 text-xs">{row.monthCount}회</span>
                        <div className="h-2 flex-1 rounded-full bg-[var(--color-sky)]">
                          <div
                            className="h-2 rounded-full bg-[var(--color-accent)]"
                            style={{ width: `${monthPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-sm">
                      {row.isDoneThisWeek ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                          이번 주 참여
                        </span>
                      ) : (
                        <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
                          확인 필요
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {monitoringRows.length === 0 && (
                <tr>
                  <td className="px-2 py-4 text-sm text-[var(--color-ink-soft)]" colSpan={5}>
                    가정을 먼저 등록하면 대시보드가 활성화됩니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}