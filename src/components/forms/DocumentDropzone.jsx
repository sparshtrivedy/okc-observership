import { useRef, useState } from 'react';
import { UploadCloud, FileCheck2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function DocumentDropzone({ label, onFileSelected, error = '', required = false, helperText = '' }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);

  function onDrop(event) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    setFileName(file.name);
    onFileSelected(file);
  }

  function onChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    onFileSelected(file);
  }

  return (
    <div
      className={cn(
        'rounded-xl border-2 border-dashed p-4 transition',
        error ? 'border-red-400 bg-red-50/30' : dragging ? 'border-clinical bg-blue-50' : 'border-slate-300 bg-slate-50/50'
      )}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={onChange} />
      <button type="button" className="w-full text-left" onClick={() => inputRef.current?.click()}>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {label}
              {required ? ' *' : ''}
            </p>
            <p className="text-xs text-slate-500">{helperText || 'Drag and drop PDF or click to upload'}</p>
          </div>
          {fileName ? <FileCheck2 className="h-5 w-5 text-emerald-600" /> : <UploadCloud className="h-5 w-5 text-slate-500" />}
        </div>
      </button>
      {fileName ? <p className="mt-2 text-xs text-emerald-700">Uploaded: {fileName}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
