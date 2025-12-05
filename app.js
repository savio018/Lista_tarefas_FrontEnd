// Configuração
const BASE_URL = 'https://lista-tarefas-api-8vlb.onrender.com';
const API_PREFIX = '/tarefas'; 

const qs = (s) => document.querySelector(s);

const tasksEl = qs('#tasks');
const newTaskForm = qs('#new-task-form');
const newTaskInput = qs('#new-task-input');
const newDescInput = qs('#new-task-desc');
const newDateInput = qs('#new-task-date');
const filterEl = qs('#filter');
const searchEl = qs('#search');

// --- NOVO: BLOQUEIO VISUAL DO CALENDÁRIO ---
// Calcula a data de hoje (YYYY-MM-DD)
const hoje = new Date();
const ano = hoje.getFullYear();
// Adiciona o zero à esquerda se for menor que 10 (ex: mês 5 vira 05)
const mes = String(hoje.getMonth() + 1).padStart(2, '0');
const dia = String(hoje.getDate()).padStart(2, '0');
const dataMinima = `${ano}-${mes}-${dia}`;

// Configura o input para não aceitar nada antes de hoje
newDateInput.min = dataMinima;
// -------------------------------------------

let tasks = [];

async function fetchTasks(){
    try{
        const res = await fetch(`${BASE_URL}${API_PREFIX}`);
        if(!res.ok) throw new Error('Erro ao buscar tarefas');
        tasks = await res.json();
        renderTasks();
    }catch(err){
        console.error(err);
        tasks = [];
        renderTasks();
    }
}

async function createTask(nome, descricao, data){
    const payload = {
        nome: nome,
        descricao: descricao,
        data: data
    };

    const res = await fetch(`${BASE_URL}${API_PREFIX}`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
    });
    if(!res.ok) throw new Error('Erro ao criar tarefa');
    return await res.json();
}

// 4. CONCLUIR TAREFA
async function concluirTask(id){
    const res = await fetch(`${BASE_URL}${API_PREFIX}/${id}/concluir`, {
        method: 'PUT'
    });
    if(!res.ok) throw new Error('Erro ao concluir tarefa');
    return await res.json();
}

// 5. DELETAR TAREFA
async function deleteTask(id){
    const res = await fetch(`${BASE_URL}${API_PREFIX}/${id}`, { method:'DELETE' });
    if(!res.ok) throw new Error('Erro ao deletar tarefa');
    return true;
}

function renderTasks(){
    const q = searchEl.value.trim().toLowerCase();
    const filter = filterEl.value;
    tasksEl.innerHTML = '';

    const filtered = tasks.filter(t => {
        const isCompleted = (t.status === 'CONCLUIDAS');
        if(filter === 'active' && isCompleted) return false;
        if(filter === 'completed' && !isCompleted) return false;
        if(q && !t.nome.toLowerCase().includes(q)) return false;
        return true;
    });

    if(filtered.length === 0){
        tasksEl.innerHTML = '<li class="task">Nenhuma tarefa encontrada.</li>';
        return;
    }

    for(const t of filtered){
        const li = document.createElement('li');
        const isCompleted = (t.status === 'CONCLUIDAS');
        li.className = 'task' + (isCompleted ? ' completed' : '');

        const chk = document.createElement('input');
        chk.type = 'checkbox';
        chk.checked = isCompleted;
        if(isCompleted) chk.disabled = true; 
        
        chk.addEventListener('change', async ()=>{
            try{
                const updated = await concluirTask(t.id);
                const idx = tasks.findIndex(x=>x.id===t.id);
                if(idx>=0) tasks[idx] = updated;
                renderTasks();
            }catch(err){
                console.error(err);
                chk.checked = !chk.checked; 
            }
        });

        const infoDiv = document.createElement('div');
        infoDiv.className = 'title';
        infoDiv.style.flex = "1";
        
        const nameSpan = document.createElement('div');
        nameSpan.textContent = t.nome;
        nameSpan.style.fontWeight = "bold";
        nameSpan.contentEditable = !isCompleted;
        
        nameSpan.addEventListener('blur', async ()=>{
            const newTitle = nameSpan.textContent.trim();
            if(newTitle === t.nome) return;
            alert("Edição de nome via frontend requer ajuste no backend para PUT completo!");
            nameSpan.textContent = t.nome;
        });

        const metaSpan = document.createElement('div');
        metaSpan.style.fontSize = "0.85rem";
        metaSpan.style.color = "#666";
        // Formata a data para ficar bonitinha (PT-BR) se quiser, ou exibe direto
        metaSpan.textContent = `${t.descricao || ''} • 📅 ${t.data || ''}`;

        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(metaSpan);

        const del = document.createElement('button');
        del.textContent = 'Excluir';
        del.addEventListener('click', async ()=>{
            if(!confirm('Deseja excluir?')) return;
            try{
                await deleteTask(t.id);
                tasks = tasks.filter(x=>x.id!==t.id);
                renderTasks();
            }catch(err){
                alert('Erro ao deletar');
            }
        });

        li.appendChild(chk);
        li.appendChild(infoDiv);
        li.appendChild(del);
        tasksEl.appendChild(li);
    }
}

// EVENTO DE CRIAR (SUBMIT)
newTaskForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    
    const nome = newTaskInput.value.trim();
    const desc = newDescInput.value.trim();
    const data = newDateInput.value;

    if(!nome || !desc || !data) {
        alert("Preencha Nome, Descrição e Data!");
        return;
    }

    // --- NOVO: VALIDAÇÃO LÓGICA DE DATA ---
    // Recalcula hoje para garantir (caso a pessoa deixe o site aberto de um dia pro outro)
    const h = new Date();
    const a = h.getFullYear();
    const m = String(h.getMonth() + 1).padStart(2, '0');
    const d = String(h.getDate()).padStart(2, '0');
    const hojeString = `${a}-${m}-${d}`;

    if (data < hojeString) {
        alert("Data inválida! Você não pode criar uma tarefa para o passado.");
        return; // Para aqui e não envia
    }
    // -------------------------------------

    try{
        const created = await createTask(nome, desc, data);
        tasks.unshift(created);
        
        newTaskInput.value = '';
        newDescInput.value = '';
        newDateInput.value = '';
        
        renderTasks();
    }catch(err){
        console.error(err);
        alert('Erro ao criar tarefa.');
    }
});

filterEl.addEventListener('change', ()=>renderTasks());
searchEl.addEventListener('input', ()=>renderTasks());

fetchTasks();
