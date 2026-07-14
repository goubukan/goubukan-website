// ==========================================
// To-Do List Application
// Local Storage機能付き
// ==========================================

class TodoApp {
    constructor() {
        // DOM要素
        this.todoForm = document.getElementById('todoForm');
        this.todoInput = document.getElementById('todoInput');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        
        // 統計情報
        this.totalTasksEl = document.getElementById('totalTasks');
        this.activeTasksEl = document.getElementById('activeTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        
        // 状態
        this.todos = [];
        this.currentFilter = 'all';
        
        this.init();
    }

    // 初期化
    init() {
        this.loadFromLocalStorage();
        this.attachEventListeners();
        this.render();
    }

    // イベントリスナー設定
    attachEventListeners() {
        // フォーム送信
        this.todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        // 完了済み削除
        this.clearCompletedBtn.addEventListener('click', () => {
            this.clearCompleted();
        });

        // フィルターボタン
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    // タスク追加
    addTodo() {
        const text = this.todoInput.value.trim();
        
        if (!text) {
            alert('タスクを入力してください');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString('ja-JP')
        };

        this.todos.unshift(todo);
        this.todoInput.value = '';
        this.todoInput.focus();
        
        this.saveToLocalStorage();
        this.render();
    }

    // タスク削除
    deleteTodo(id) {
        if (confirm('このタスクを削除しますか？')) {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveToLocalStorage();
            this.render();
        }
    }

    // タスク完了状態切り替え
    toggleTodo(id) {
        this.todos = this.todos.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        this.saveToLocalStorage();
        this.render();
    }

    // 完了済みタスク全削除
    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            alert('削除する完了済みタスクがありません');
            return;
        }

        if (confirm(`${completedCount}個の完了済みタスクを削除しますか？`)) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveToLocalStorage();
            this.render();
        }
    }

    // フィルター設定
    setFilter(filter) {
        this.currentFilter = filter;
        
        // ボタンの状態更新
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    // フィルター済みタスク取得
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    // 統計情報更新
    updateStats() {
        const total = this.todos.length;
        const active = this.todos.filter(t => !t.completed).length;
        const completed = this.todos.filter(t => t.completed).length;

        this.totalTasksEl.textContent = total;
        this.activeTasksEl.textContent = active;
        this.completedTasksEl.textContent = completed;
    }

    // レンダリング
    render() {
        const filtered = this.getFilteredTodos();
        
        // リストクリア
        this.todoList.innerHTML = '';

        if (this.todos.length === 0) {
            this.emptyState.classList.remove('hidden');
        } else {
            this.emptyState.classList.add('hidden');
        }

        // タスク表示
        filtered.forEach(todo => {
            const li = this.createTodoElement(todo);
            this.todoList.appendChild(li);
        });

        // 統計情報更新
        this.updateStats();

        // 完了済み削除ボタンの状態
        const hasCompleted = this.todos.some(t => t.completed);
        this.clearCompletedBtn.disabled = !hasCompleted;
    }

    // タスク要素作成
    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="checkbox" 
                ${todo.completed ? 'checked' : ''}
                data-id="${todo.id}"
            >
            <span class="todo-text">${this.escapeHtml(todo.text)}</span>
            <button class="btn-delete" data-id="${todo.id}">削除</button>
        `;

        // チェックボックス
        li.querySelector('.checkbox').addEventListener('change', () => {
            this.toggleTodo(todo.id);
        });

        // 削除ボタン
        li.querySelector('.btn-delete').addEventListener('click', () => {
            this.deleteTodo(todo.id);
        });

        return li;
    }

    // XSS対策
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ローカルストレージに保存
    saveToLocalStorage() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
            console.log('✅ タスクを保存しました');
        } catch (error) {
            console.error('❌ ローカルストレージの保存に失敗しました:', error);
        }
    }

    // ローカルストレージから読み込み
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('todos');
            this.todos = saved ? JSON.parse(saved) : [];
            console.log(`✅ ${this.todos.length}個のタスクを読み込みました`);
        } catch (error) {
            console.error('❌ ローカルストレージの読み込みに失敗しました:', error);
            this.todos = [];
        }
    }
}

// ページ読み込み時に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new TodoApp();
    });
} else {
    new TodoApp();
}
