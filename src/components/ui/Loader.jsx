// src/components/ui/Loader.jsx
export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-10 h-10 border-2 border-border border-t-teal rounded-full animate-spin" />
      <p className="text-muted text-sm font-mono">{text}</p>
    </div>
  );
}
