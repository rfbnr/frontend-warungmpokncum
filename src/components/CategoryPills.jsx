export default function CategoryPills({ categories, activeId, onPick }) {
  return (
    <div className="flex gap-3 flex-wrap items-center justify-center py-4">
      {categories.map(c => (
        <button
          key={c.id}
          onClick={() => onPick(c.id)}
          className={`px-4 py-1.5 rounded-full border text-sm transition
            ${activeId===c.id ? 'bg-brand-700 text-white border-brand-700' : 'bg-white text-gray-700 hover:bg-slate-50'}
          `}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
