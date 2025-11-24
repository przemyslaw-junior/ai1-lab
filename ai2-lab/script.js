class Todo {
  constructor() {
    this.list = document.querySelector('#taskList');
    this.input = document.querySelector('#taskInput');
    this.date = document.querySelector('#taskDate');
    this.search = document.querySelector('#searchInput');
    this.addBtn = document.querySelector('#addButton');

    this.tasks = [];

    this.addBtn.addEventListener('click', () => this.add());
    this.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.add(); });
    this.date.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.add(); });
    this.search.addEventListener('input', () => this.draw());

    this.load();
    this.draw();
    this.input.focus();
  }

  validate(text, dateStr) {
    if (text.length < 3 || text.length > 255) {
      alert('Tekst zadania musi mieć 3-255 znaków.');
      return false;
    }
    if (dateStr) {
      const now = new Date();
      const chosen = new Date(dateStr);
      if (chosen <= now) {
        alert('Data musi być w przyszłości.');
        return false;
      }
    }
    return true;
  }

  add() {
    const text = this.input.value.trim();
    const date = this.date.value;

    if (!this.validate(text, date)) return;

    this.tasks.push({ text, date });
    this.save();
    this.draw();

    this.input.value = '';
    this.date.value = '';
    this.input.focus();
  }

  remove(index) {
    this.tasks.splice(index, 1);
    this.save();
    this.draw();
  }

  edit(index, newText, newDate) {
    this.tasks[index].text = newText;
    this.tasks[index].date = newDate;
    this.save();
    this.draw();
  }

  highlight(text, term) {
    if (!term) return this.escapeHtml(text);
    const escTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escTerm, 'gi');
    return this.escapeHtml(text).replace(re, (m) => `<mark>${m}</mark>`);
  }

  escapeHtml(str) {
    return str
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  draw() {
    this.list.innerHTML = '';

    const term = this.search.value.trim();
    const doFilter = term.length >= 2;
    const lower = term.toLowerCase();

    const visible = this.tasks.filter(t => {
      if (!doFilter) return true;
      return t.text.toLowerCase().includes(lower);
    });

    visible.forEach((task, index) => {
      const li = document.createElement('li');

      const span = document.createElement('span');
      const textWithMark = doFilter ? this.highlight(task.text, term) : this.escapeHtml(task.text);
      const datePart = task.date ? ` (${this.escapeHtml(task.date)})` : '';
      span.innerHTML = `${textWithMark}${datePart}`;

      span.addEventListener('click', (ev) => {
        ev.stopPropagation();
        this.enterEditMode(li, index);
      });

      const del = document.createElement('button');
      del.textContent = 'Kosz';
      del.className = 'delete';
      del.addEventListener('click', (e) => { e.stopPropagation(); this.remove(index); });

      li.appendChild(span);
      li.appendChild(del);
      this.list.appendChild(li);
    });
  }

  enterEditMode(li, index) {
    const task = this.tasks[index];
    li.innerHTML = '';

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.value = task.text;
    textInput.style.flex = '1';
    textInput.style.marginRight = '8px';

    const dateInput = document.createElement('input');
    dateInput.type = 'datetime-local';
    dateInput.value = task.date || '';

    li.appendChild(textInput);
    li.appendChild(dateInput);
    textInput.focus();

    const saveChange = () => {
      const newText = textInput.value.trim();
      const newDate = dateInput.value;
      if (!this.validate(newText, newDate)) return;
      this.edit(index, newText, newDate);
    };

    textInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveChange(); });
    dateInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveChange(); });

    const outside = (e) => {
      if (!li.contains(e.target)) {
        document.removeEventListener('click', outside);
        saveChange();
      }
    };
    setTimeout(() => document.addEventListener('click', outside), 0);
  }

  save() {
    localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
  }

  load() {
    const data = localStorage.getItem('todoTasks');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        this.tasks = Array.isArray(parsed) ? parsed.map(t => ({
          text: typeof t.text === 'string' ? t.text : '',
          date: typeof t.date === 'string' ? t.date : ''
        })) : [];
      } catch (_) {
        this.tasks = [];
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Todo();
});