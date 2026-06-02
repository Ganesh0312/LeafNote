import React from 'react';

export default function FormInput({
  label,
  name,
  type = 'text',
  placeholder,
  register,
  error,
  icon: Icon,
}) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold text-zinc-400 dark:text-zinc-450 uppercase tracking-wider block">
          {label}
        </label>
      )}
      <div
        className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition bg-zinc-950 text-zinc-400 focus-within:border-zinc-500 dark:bg-zinc-950 dark:border-zinc-850 dark:text-zinc-400 dark:focus-within:border-zinc-700 ${
          error ? 'border-red-900/80 focus-within:border-red-800' : 'border-zinc-800'
        }`}
      >
        {Icon && <Icon size={16} className="text-zinc-500 flex-shrink-0" />}
        <input
          type={type}
          placeholder={placeholder}
          {...register(name)}
          className="bg-transparent text-sm w-full outline-none border-none text-white placeholder-zinc-650"
        />
      </div>
      {error && (
        <p className="text-[10px] text-red-400 font-semibold tracking-wide mt-0.5">
          {error.message}
        </p>
      )}
    </div>
  );
}
