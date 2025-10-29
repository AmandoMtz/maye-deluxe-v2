import { useEffect, useMemo, useState } from "react";
import CuteAvatar from "../components/CuteAvatar.jsx";
import { useNavigate } from "react-router-dom";

export default function TareasUni(){
  const nav = useNavigate();

  // ==== Tema y fondo igual que Home ====
  const Bg = () => (
    <div className="pointer-events-none select-none fixed inset-0 -z-10">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-75"
        style={{ backgroundImage: "url('/melanie-bg-2.gif')" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(255,209,241,.55),rgba(255,255,255,0)_70%)]" />
      <div className="absolute inset-0 backdrop-blur-[1.2px]" />
    </div>
  );

  // ==== Usuario + almacenamiento por usuario ====
  const [user, setUser] = useState("Maye");
  const key = useMemo(() => `tareas:${user}`, [user]);

  const load = () => JSON.parse(localStorage.getItem(key) ?? "[]");
  const save = (arr) => localStorage.setItem(key, JSON.stringify(arr));

  // ==== Estado ====
  const [tasks, setTasks] = useState([]);
  const [editing, setEditing] = useState(null); // id | null

  // Form nueva/edición
  const emptyForm = { title:"", desc:"", due:"", status:"todo", images:[] };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const u = localStorage.getItem("maye_user") || "Mayela";
    setUser(u);
  }, []);

  useEffect(() => {
    setTasks(load());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // ==== Utils ====
  const fileToDataURL = (file) =>
    new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });

  const addImagesFromInput = async (files) => {
    const arr = Array.from(files || []);
    if (!arr.length) return;
    const urls = await Promise.all(arr.map(fileToDataURL));
    setForm(f => ({
      ...f,
      images: [...f.images, ...urls.map(u => ({ id: crypto.randomUUID(), url: u }))]
    }));
  };

  const resetForm = () => { setEditing(null); setForm(emptyForm); };

  const createTask = () => {
    if (!form.title.trim()) return;
    const t = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      ...form,
    };
    const arr = [t, ...tasks];
    setTasks(arr); save(arr); resetForm();
  };

  const updateTask = () => {
    if (!editing) return;
    const arr = tasks.map(t => t.id === editing ? { ...t, ...form } : t);
    setTasks(arr); save(arr); resetForm();
  };

  const deleteTask = (id) => {
    const arr = tasks.filter(t => t.id !== id);
    setTasks(arr); save(arr);
    if (editing === id) resetForm();
  };

  const moveTask = (id, dir) => {
    const order = ["todo","doing","done"];
    const arr = tasks.map(t => {
      if (t.id !== id) return t;
      const i = order.indexOf(t.status);
      const ni = Math.min(order.length-1, Math.max(0, i + (dir === "next" ? 1 : -1)));
      return { ...t, status: order[ni] };
    });
    setTasks(arr); save(arr);
  };

  const startEdit = (t) => {
    setEditing(t.id);
    setForm({ title:t.title, desc:t.desc, due:t.due, status:t.status, images:t.images || [] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeImage = (imgId) => {
    setForm(f => ({ ...f, images: f.images.filter(i => i.id !== imgId) }));
  };

  // ==== Filtros y agrupación ====
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return tasks;
    return tasks.filter(t =>
      (t.title + " " + t.desc).toLowerCase().includes(s)
    );
  }, [tasks, q]);

  const group = (status) => filtered.filter(t => t.status === status);
  const statuses = [
    { key:"todo",  title:"Por hacer" },
    { key:"doing", title:"En proceso" },
    { key:"done",  title:"Hechas" },
  ];

  const fmt = (d) => d ? new Date(d).toLocaleDateString() : "—";

  return (
    <div className="min-h-screen uwu-theme relative overflow-hidden p-6 text-ink">
      <style>{`
        .uwu-theme{ --uwu-rose:#ff8bd5; --uwu-violet:#b069ff; }
        .uwu-theme .card-kawaii{
          position:relative;border-radius:1.25rem;
          box-shadow:0 0 0 1.5px rgba(255,139,213,.75),
                     0 12px 28px rgba(255,160,210,.28),
                     0 0 34px rgba(255,160,210,.45);
          background:rgba(255,255,255,.86);
        }
        .uwu-theme .card-kawaii::before{
          content:"";position:absolute;inset:-2px;border-radius:inherit;pointer-events:none;
          background:conic-gradient(from 180deg,rgba(255,139,213,.45),rgba(176,105,255,.35),rgba(255,139,213,.45));
          filter:blur(10px);opacity:.9;z-index:-1;
        }
        .uwu-theme .input-kawaii{
          border-radius:1.1rem;background:rgba(255,255,255,.92);
          box-shadow:inset 0 2px 6px rgba(0,0,0,.03),0 0 0 1.5px rgba(255,139,213,.75),0 0 22px rgba(255,160,210,.35);
          outline:none;
        }
        .uwu-theme .input-kawaii:focus{
          box-shadow:inset 0 2px 6px rgba(0,0,0,.03),0 0 0 2px var(--uwu-rose),0 0 26px rgba(255,160,210,.55);
        }
        .uwu-theme .btn-kawaii{
          border-radius:1.2rem;background-image:linear-gradient(135deg,var(--uwu-rose),var(--uwu-violet));color:#fff;
          box-shadow:0 8px 18px rgba(255,160,210,.38),0 0 0 1.5px rgba(255,139,213,.75);
          transition:transform .15s ease, box-shadow .2s ease, filter .2s ease;
        }
        .uwu-theme .btn-kawaii:hover{ filter:brightness(1.05);box-shadow:0 10px 22px rgba(255,160,210,.55),0 0 0 2px rgba(255,139,213,.9); }
        .uwu-theme .btn-kawaii:active{ transform:scale(.98); }
        .uwu-theme .btn-kawaii.subtle{ background:#fff;color:#cc4ea4;box-shadow:0 0 0 1.5px rgba(255,139,213,.7),0 8px 16px rgba(255,160,210,.20); }
        .uwu-theme .chip{ background:rgba(255,255,255,.9); box-shadow:0 0 0 1.5px rgba(255,139,213,.7), 0 6px 14px rgba(255,160,210,.25); border-radius:999px; }
        .uwu-theme .img-thumb{ border-radius:.8rem; box-shadow:0 0 0 1.5px rgba(255,139,213,.6), 0 6px 14px rgba(255,160,210,.25); }
      `}</style>
      <Bg />

      {/* Header */}
            <header className="max-w-7xl mx-auto flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <CuteAvatar userKey={user} size={40} />
            <h2 className="font-display text-2xl text-petal">Tareas / Uni</h2>
        </div>
        <div className="flex gap-3">
            <button className="btn-kawaii" onClick={() => nav('/home')}>Home</button>
            <button className="btn-kawaii" onClick={() => nav(-1)}>Atrás</button>
        </div>
        </header>


      {/* Form crear/editar */}
      <section className="max-w-7xl mx-auto grid lg:grid-cols-4 md:grid-cols-2 gap-5 mb-6">
        <div className="card-kawaii p-4 lg:col-span-2">
          <h3 className="font-display text-xl mb-3 text-petal">{editing ? "✏️ Editar tarea" : "🪄 Nueva tarea"}</h3>

          <input
            className="input-kawaii w-full mb-2 px-3 py-2"
            placeholder="Título de la tarea"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title:e.target.value }))}
          />
          <textarea
            className="input-kawaii w-full mb-2 px-3 py-2"
            rows="4"
            placeholder="Descripción / notas"
            value={form.desc}
            onChange={e => setForm(f => ({ ...f, desc:e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="date"
              className="input-kawaii w-full px-3 py-2"
              value={form.due}
              onChange={e => setForm(f => ({ ...f, due:e.target.value }))}
            />
            <select
              className="input-kawaii w-full px-3 py-2"
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status:e.target.value }))}
            >
              <option value="todo">Por hacer</option>
              <option value="doing">En proceso</option>
              <option value="done">Hecha</option>
            </select>
          </div>

          {/* imágenes */}
          <div className="mb-3">
            <label className="block text-sm mb-1 text-ink/70">Imágenes (puedes subir varias)</label>
            <input type="file" accept="image/*" multiple onChange={e => addImagesFromInput(e.target.files)} />
            {form.images.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {form.images.map(img => (
                  <div key={img.id} className="relative">
                    <img src={img.url} alt="adjunto" className="img-thumb w-24 h-24 object-cover" />
                    <button
                      className="btn-kawaii subtle absolute -top-2 -right-2 text-xs px-2 py-0.5"
                      onClick={() => removeImage(img.id)}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {editing ? (
              <>
                <button className="btn-kawaii" onClick={updateTask}>Guardar cambios</button>
                <button className="btn-kawaii subtle" onClick={resetForm}>Cancelar</button>
              </>
            ) : (
              <button className="btn-kawaii" onClick={createTask}>Crear tarea</button>
            )}
          </div>
        </div>

        <div className="card-kawaii p-4">
          <h3 className="font-display text-xl mb-3 text-petal">🔎 Buscar</h3>
          <input
            className="input-kawaii w-full px-3 py-2"
            placeholder="Filtra por título o descripción…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <p className="mt-3 text-sm text-ink/60">Total: {filtered.length}</p>
        </div>
      </section>

      {/* Tablero (ocupa todo el ancho) */}
      <main className="max-w-[1600px] mx-auto grid lg:grid-cols-3 gap-5 pb-10">
        {statuses.map(col => (
          <section key={col.key} className="card-kawaii p-4 min-h-[50vh]">
            <h3 className="font-display text-lg mb-3 text-petal">
              {col.title} <span className="chip px-3 py-1 ml-1 text-sm">{group(col.key).length}</span>
            </h3>

            <ul className="space-y-3">
              {group(col.key).map(t => (
                <li key={t.id} className="rounded-2xl p-3 bg-white/80 shadow-sm ring-1 ring-pink-200/70">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-xs px-2 py-1 chip">{fmt(t.due)}</div>
                  </div>

                  {t.desc && <p className="mt-1 text-sm text-ink/80 whitespace-pre-wrap">{t.desc}</p>}

                  {/* mini galería */}
                  {t.images?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {t.images.map(img => (
                        <img key={img.id} src={img.url} alt="" className="img-thumb w-20 h-20 object-cover" />
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="btn-kawaii subtle text-xs" onClick={() => startEdit(t)}>Editar</button>
                    <button className="btn-kawaii subtle text-xs" onClick={() => deleteTask(t.id)}>Borrar</button>
                    {t.status !== "todo"  && <button className="btn-kawaii subtle text-xs" onClick={() => moveTask(t.id,"prev")}>←</button>}
                    {t.status !== "done"  && <button className="btn-kawaii subtle text-xs" onClick={() => moveTask(t.id,"next")}>→</button>}
                  </div>
                </li>
              ))}
              {group(col.key).length === 0 && (
                <li className="text-sm text-ink/50 italic">Sin tareas aquí…</li>
              )}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
