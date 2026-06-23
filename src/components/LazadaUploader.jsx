import { FileUp } from 'lucide-react';

export default function LazadaUploader({ onProcess }) {
  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <FileUp className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-sm font-semibold text-blue-700">Upload Lazada CSV</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept=".csv" 
          onChange={(e) => onProcess(e.target.files[0])} 
        />
      </label>
    </div>
  );
}
