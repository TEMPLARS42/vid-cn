import React from 'react';
import { Loader2 } from 'lucide-react';

const UploadProgress = () => {
  return (
    <div className="upload-progress">
      <div className="d-flex align-items-center justify-content-center text-muted">
        <Loader2 className="animate-spin me-2" size={20} />
      </div>
    </div>
  );
};

export default UploadProgress;