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

export default function Dashboard() {
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
      <section className="card-surface flex flex-col gap-3 p-6 text-black">
        <p className="text-sm font-semibold tracking-[0.2em] text-[#6b8e23]">
          사랑과평안의교회
        </p>
        <h1 className="text-3xl font-bold md:text-4xl text-black">
          가정예배 실시 현황 모니터링
        </h1>
        <p className="max-w-4xl text-sm leading-7 text-gray-600 md:text-base">
          관리자용 모니터링 페이지입니다. (데이터는 브라우저에 임시 저장됩니다.)
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_1.5fr_1.4fr] text-black">
        <article className="card-surface flex flex-col gap-4 p-5 bg-white rounded-2xl shadow-sm">
          <h2 className="text-2xl font-bold">가정 관리</h2>
          <form className="flex gap-2" onSubmit={handleAddHousehold}>
            <input
              type="text"
              placeholder="예: 2가정"
              value={newHouseholdName}
              onChange={(event) => setNewHouseholdName(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#6b8e23]"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#6b8e23] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              추가
            </button>
          </form>

          <div className="space-y-2">
            {households.length === 0 ? (
              <p className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-500">
                먼저 가정을 추가해 주세요.
              </p>
            ) : (
              households.map((household) => (
                <div
                  key={household.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-3 py-2"
                >
                  <span className="text-sm font-medium">
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

        <article className="card-surface flex flex-col gap-4 p-5 bg-white rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {formatMonth(monthCursor)}
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-600 transition hover:border-[#6b8e23]"
              >
                이전
              </button>
              <button
                type="button"
                onClick={goToNextMonth}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-600 transition hover:border-[#6b8e23]"
              >
                다음
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {DAY_LABELS.map((dayLabel) => (
              <div
                key={dayLabel}
                className="pb-1 text-center text-xs font-semibold text-gray-400"
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
                      ? "border-[#6b8e23] bg-green-50"
                      : "border-gray-100 bg-white hover:border-[#6b8e23]"
                  } ${isCurrentMonth ? "" : "opacity-45"}`}
                >
                  <p className="text-sm font-semibold">
                    {day.getDate()}
                  </p>
                  {checkedCount > 0 && (
                    <span className="absolute bottom-2 right-2 rounded-full bg-[#6b8e23] px-2 py-0.5 text-[10px] font-semibold text-white">
                      {checkedCount}가정
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </article>

        <article className="card-surface flex flex-col gap-4 p-5 bg-white rounded-2xl shadow-sm">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-400">선택 날짜</p>
            <p className="mt-1 text-lg font-semibold">
              {formatDate(selectedDate)}
            </p>
          </div>

          <h2 className="text-2xl font-bold">임시 기록 (로컬)</h2>
          <div className="max-h-[420px] space-y-3 overflow-auto pr-1">
            {households.map((household) => {
              const key = getRecordKey(household.id, selectedDateKey);
              const record = recordsByKey.get(key);

              return (
                <div
                  key={household.id}
                  className="rounded-2xl border border-gray-100 bg-white p-3"
                >
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={record?.checked ?? false}
                      onChange={(event) =>
                        updateRecord(household.id, selectedDateKey, {
                          checked: event.target.checked,
                        })
                      }
                      className="h-4 w-4 accent-[#6b8e23]"
                    />
                    {household.name}
                  </label>
                  <textarea
                    value={record?.note ?? ""}
                    onChange={(event) =>
                      updateRecord(household.id, selectedDateKey, {
                        note: event.target.value,
                      })
                    }
                    placeholder="메모를 입력하세요"
                    className="h-20 w-full resize-none rounded-xl border border-gray-100 px-3 py-2 text-sm outline-none transition focus:border-[#6b8e23]"
                  />
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </main>
  );
}
