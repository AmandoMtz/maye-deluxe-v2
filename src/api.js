const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';
export const getNotes = async (owner)=> (await fetch(`${API_BASE}/api/notes?owner=${encodeURIComponent(owner)}`)).json();
export const addNote = async ({owner,title,content})=> (await fetch(`${API_BASE}/api/notes`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner,title,content})})).json();
export const getPlans = async (owner)=> (await fetch(`${API_BASE}/api/plans?owner=${encodeURIComponent(owner)}`)).json();
export const addPlan = async ({owner,title})=> (await fetch(`${API_BASE}/api/plans`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner,title})})).json();
export const togglePlan = async (id)=> (await fetch(`${API_BASE}/api/plans/${id}/toggle`,{method:'PATCH'})).json();
