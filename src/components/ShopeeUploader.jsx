import { Box } from 'lucide-react';

export default function ShopeeUploader({ onProcess }) {
  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-orange-300 rounded-lg cursor-pointer bg-orange-50 hover:bg-orange-100">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Box className="w-8 h-8 text-orange-500 mb-2" />
          <p className="text-sm font-semibold text-orange-700">Upload Shopee CSV</p>
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
