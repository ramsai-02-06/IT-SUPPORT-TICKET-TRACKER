"use strict";

const STORAGE_KEY = "mini-it-support-tickets";
const STATUSES = ["Open", "In Progress", "Resolved"];
const CATEGORIES = ["Hardware", "Software", "Network", "Access"];
const PRIORITIES = ["Low", "Medium", "High"];

const form = document.querySelector("#ticket-form");
const ticketList = document.querySelector("#ticket-list");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyDescription = document.querySelector("#empty-description");
const searchInput = document.querySelector("#ticket-search");
const categoryFilter = document.querySelector("#category-filter");
const clearFiltersButton = document.querySelector("#clear-filters");
const allResolvedMessage = document.querySelector("#all-resolved-message");
const ticketTotal = document.querySelector("#ticket-total");
const formMessage = document.querySelector("#form-message");
const storageNotice = document.querySelector("#storage-notice");

let tickets = loadTickets();

function isTicket(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.requester === "string" &&
    typeof value.category === "string" &&
    CATEGORIES.includes(value.category) &&
    typeof value.priority === "string" &&
    PRIORITIES.includes(value.priority) &&
    typeof value.description === "string" &&
    typeof value.status === "string" &&
    STATUSES.includes(value.status) &&
    typeof value.createdAt === "string"
  );
}

function loadTickets() {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (storedValue === null) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue) || !parsedValue.every(isTicket)) {
      storageNotice.textContent = "Saved ticket data could not be read. Starting with an empty ticket list.";
      storageNotice.hidden = false;
      return [];
    }

    return parsedValue;
  } catch {
    storageNotice.textContent = "Saved ticket data is unavailable or invalid. The app will run without loading it.";
    storageNotice.hidden = false;
    return [];
  }
}

function saveTickets() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    storageNotice.hidden = true;
    return true;
  } catch {
    storageNotice.textContent = "Tickets changed in this page, but could not be saved in this browser.";
    storageNotice.hidden = false;
    return false;
  }
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function getStatusClass(status) {
  return status.toLowerCase().replaceAll(" ", "-");
}

function createTicketCard(ticket) {
  const card = createElement(
    "article",
    `ticket-card${ticket.status !== "Resolved" ? " is-unresolved" : ""}${ticket.priority === "High" ? " is-high-priority" : ""}`
  );
  const topLine = createElement("div", "ticket-topline");
  const title = createElement("h3", "ticket-title", ticket.title);
  const priority = createElement("span", `priority-label priority-${ticket.priority.toLowerCase()}`, `${ticket.priority} priority`);
  topLine.append(title, priority);

  const metadata = createElement("div", "ticket-meta");
  metadata.append(
    createElement("span", "", `By ${ticket.requester}`),
    createElement("span", "", ticket.category),
    createElement("span", "", formatDate(ticket.createdAt))
  );

  const description = createElement("p", "ticket-description", ticket.description);
  const actions = createElement("div", "ticket-actions");
  const statusGroup = createElement("div", "ticket-controls");
  const statusLabel = createElement("span", `status-label status-${getStatusClass(ticket.status)}`, ticket.status);
  const statusSelect = document.createElement("select");
  statusSelect.className = "status-select";
  statusSelect.setAttribute("aria-label", `Update status for ${ticket.title}`);

  for (const status of STATUSES) {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    option.selected = status === ticket.status;
    statusSelect.append(option);
  }

  statusSelect.addEventListener("change", () => {
    updateTicketStatus(ticket.id, statusSelect.value);
  });

  const deleteButton = createElement("button", "delete-button", "Delete");
  deleteButton.type = "button";
  deleteButton.setAttribute("aria-label", `Delete ticket: ${ticket.title}`);
  deleteButton.addEventListener("click", () => deleteTicket(ticket.id));

  statusGroup.append(statusLabel, statusSelect);
  actions.append(statusGroup, deleteButton);
  card.append(topLine, metadata, description, actions);
  return card;
}

function formatDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function renderTickets() {
  const searchTerm = searchInput.value.trim().toLocaleLowerCase();
  const selectedCategory = categoryFilter.value;
  const visibleTickets = tickets.filter((ticket) => {
    return (
      (!searchTerm ||
        ticket.title.toLocaleLowerCase().includes(searchTerm) ||
        ticket.requester.toLocaleLowerCase().includes(searchTerm)) &&
      (!selectedCategory || ticket.category === selectedCategory)
    );
  });

  ticketList.replaceChildren(...visibleTickets.map(createTicketCard));
  ticketList.setAttribute("aria-busy", "false");
  updateCounts();
  ticketTotal.textContent = `${visibleTickets.length} ${visibleTickets.length === 1 ? "ticket" : "tickets"}`;
  allResolvedMessage.hidden = tickets.length === 0 || !tickets.every((ticket) => ticket.status === "Resolved");

  if (visibleTickets.length === 0) {
    emptyState.hidden = false;
    if (tickets.length === 0) {
      emptyTitle.textContent = "No tickets yet";
      emptyDescription.textContent = "New requests will appear here once submitted.";
    } else {
      emptyTitle.textContent = "No matching tickets";
      emptyDescription.textContent = "Try another search or category, or clear the filters.";
    }
  } else {
    emptyState.hidden = true;
  }
}

function updateCounts() {
  for (const status of STATUSES) {
    const count = tickets.filter((ticket) => ticket.status === status).length;
    const countId = `count-${getStatusClass(status)}`;
    document.querySelector(`#${countId}`).textContent = String(count);
  }
}

function updateTicketStatus(ticketId, status) {
  if (!STATUSES.includes(status)) {
    return;
  }

  tickets = tickets.map((ticket) => (
    ticket.id === ticketId ? { ...ticket, status } : ticket
  ));
  saveTickets();
  renderTickets();
}

function deleteTicket(ticketId) {
  const ticket = tickets.find((item) => item.id === ticketId);
  if (!ticket || !window.confirm(`Delete "${ticket.title}"? This cannot be undone.`)) {
    return;
  }

  tickets = tickets.filter((item) => item.id !== ticketId);
  saveTickets();
  renderTickets();
}

function showFormMessage(message, isError) {
  formMessage.textContent = message;
  formMessage.classList.toggle("error", isError);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  showFormMessage("", false);

  const formData = new FormData(form);
  const title = String(formData.get("title") ?? "").trim();
  const requester = String(formData.get("requester") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const priority = String(formData.get("priority") ?? "");
  const description = String(formData.get("description") ?? "").trim();

  if (!title) {
    showFormMessage("Enter a ticket title. A title cannot contain only spaces.", true);
    document.querySelector("#ticket-title").focus();
    return;
  }

  if (!requester || !CATEGORIES.includes(category) || !PRIORITIES.includes(priority) || !description) {
    showFormMessage("Complete all required fields before submitting.", true);
    return;
  }

  tickets.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title,
    requester,
    category,
    priority,
    description,
    status: "Open",
    createdAt: new Date().toISOString()
  });

  saveTickets();
  form.reset();
  showFormMessage("Ticket submitted successfully.", false);
  renderTickets();
  document.querySelector("#ticket-title").focus();
});

searchInput.addEventListener("input", renderTickets);
categoryFilter.addEventListener("change", renderTickets);
clearFiltersButton.addEventListener("click", () => {
  searchInput.value = "";
  categoryFilter.value = "";
  renderTickets();
  searchInput.focus();
});

renderTickets();
