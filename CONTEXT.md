# Workout Plan

A single-user web app for running a fixed 12-week strength program: configure the plan, train one day at a time, and review progress. All state is local to the browser.

## Language

### Plan structure

**Training Plan**:
The whole 12-week program the user follows — its workouts, prescriptions, and start date.
_Avoid_: program, routine, schedule (the schedule is derived, not the plan).

**Workout**:
One named training day template (e.g. "Upper Strength"), independent of any week.
_Avoid_: day, split, routine.

**Exercise**:
A movement inside a Workout, carrying a per-week Prescription and a default rest duration.
_Avoid_: lift, movement (use "Exercise" in code; "lift" is fine in user-facing strength copy).

**Prescription**:
The planned target for an Exercise in a given Week, stored as free text (e.g. "4 x 5-8", "3 rounds", "40-50 min").
_Avoid_: target (the field is named `target`, but the concept is the Prescription), goal.

**Set**:
One checkable unit of work within an Exercise's Prescription, optionally carrying a logged actual.

**Phase**:
The periodization block a Week belongs to: Build, Deload, Strength, or Power + Test.

### Time and sessions

**Week**:
A 1-12 index into the Training Plan. The unit the UI navigates by.

**Session**:
A Workout on a specific Week — the thing you actually do. Carries a Planned date, a Completion, a Status, and (once trained) an Actual date.
_Avoid_: workout-week, instance, occurrence.

**Planned date**:
The calendar date a Session is scheduled for, derived from the Plan start date, the Workout's fixed weekday, and any catch-up shifts. Never stored per Session.
_Avoid_: scheduled date, due date.

**Actual date**:
The calendar date a Session was actually trained, captured (default today, editable) the first time it is logged.
_Avoid_: completed date is the field name (`completedDate`); the concept is the Actual date.

**Status**:
A Session's derived state: upcoming, today, done (on-time or late), missed, or skipped. Never stored — always computed from Planned date, Log, Actual date, and skip flag.

### Logging and progress

**Log**:
The record of what the user actually did — per Exercise, per Week: actual text, notes, and per-Set completion.
_Avoid_: history, journal.

**Completion**:
The percentage of a Session's Exercises that have any logged activity.
_Avoid_: progress (too broad).

**Adherence**:
How Sessions that were due landed against their Planned dates: on-time, late, missed, skipped counts.

## Relationships

- A **Training Plan** has many **Workouts**; a **Workout** has many **Exercises**.
- A **Workout** combined with a **Week** is a **Session** (12 Sessions per Workout).
- An **Exercise** has one **Prescription** per **Week**, made of **Sets**.
- A **Session**'s **Planned date** is derived; its **Actual date** is recorded in the **Log**.
- A **Session**'s **Status** and **Completion** are derived from the **Log**, the **Planned date**, and the **Actual date** — never stored.
- **Adherence** aggregates **Status** across all due **Sessions**.

## Example dialogue

> **Dev:** "When I open Train on Monday, why does the Upper Strength card say 'Missed'?"
> **Domain expert:** "Upper Strength is Sunday's **Workout**. This **Week**'s Sunday **Session** has a **Planned date** of yesterday and no **Log**, so its **Status** derives to missed. Log it today and it becomes done, one day late — the **Actual date** is stamped as today."

## Flagged ambiguities

- "workout" was used for both the reusable day template and the thing-you-do-on-a-date. Resolved: **Workout** is the template; a **Workout** + **Week** is a **Session**.
- "target" (the `PlanExercise.targets` field) names the storage; the domain concept is the **Prescription**.
