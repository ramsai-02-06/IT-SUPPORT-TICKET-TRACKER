# Mini IT Support Ticket System

## Business Context

A small organization needs a lightweight way to track internal IT support requests.

Employees raise issues; support staff track priority and progress.

## Target Users

- Employees who report IT issues
- IT support staff who triage and resolve tickets

## Core Requirements

- Create a ticket with title, requester, category, priority, and description.
- Show all tickets in a readable list or table.
- Update status: Open, In Progress, or Resolved.
- Search tickets by title or requester.
- Filter tickets by category and clear active search and category filters.
- Delete a ticket with a clear user action.
- Display counts for Open, In Progress, and Resolved tickets.
- Highlight high-priority and unresolved tickets.
- Show an empty state when there are no tickets.

## Constraints

- Use HTML, CSS, and vanilla JavaScript only.
- No backend, database, external libraries, frameworks, or paid APIs.
- Persist tickets in browser localStorage.
- The app must run locally in a modern browser.

## User Experience

Keep the UI simple, responsive, accessible, and easy for a first-time user.

## Run the App

Open `index.html` in a modern browser. No installation or build step is required.

## Test the App

1. Create a ticket with all fields and verify it appears in the list.
2. Submit a whitespace-only title and verify it is rejected with a helpful message.
3. Change a ticket through Open, In Progress, and Resolved; verify the counts update.
4. Search by title and requester.
5. Select a category and verify only tickets in that category appear. Combine category filtering with search, then use **Clear filters** and verify all tickets return.
6. Resolve every ticket and verify the friendly all-resolved message appears. Reopen a ticket and verify the message disappears.
7. Refresh the page and verify saved tickets remain.
8. Delete a ticket, verify the confirmation appears, cancel once to keep it, then confirm deletion and verify the list and counts update.
9. Resize the browser to check the responsive layout and use the keyboard to check focus visibility.
