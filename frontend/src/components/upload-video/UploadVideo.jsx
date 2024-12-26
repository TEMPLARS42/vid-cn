import React, { useState } from 'react';
import { Upload, Film, FileVideo, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import UploadProgress from './UploadProgress';
import VideoPreview from './VideoPreview.jsx';
import RichTextEditor from './editor/RichTextEditor.jsx';
import { toasty } from '../../configs/toasty.config.js';

const UploadVideo = ({ onVideoUpload }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors }
    } = useForm();

    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) {
            handleFileSelection(file);
        } else {
            setError('Please upload a valid video file');
        }
    };

    const handleFileSelection = (file) => {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelection(file);
        }
    };

    const handleDescriptionChange = (content) => {
        setValue('description', content);
    };

    const onSubmit = async (data) => {
        if (!selectedFile) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('files', selectedFile);
            formData.append('data', JSON.stringify(data));

            const response = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            clearSelection();
            toasty.success(response.data.message);
        } catch (error) {
            console.error(error);
            toasty.error(error?.response?.data?.message || "Something went wrong");
        } finally {
            setUploading(false);
        }
    };

    const clearSelection = () => {
        reset({});
        setSelectedFile(null);
        setPreviewUrl('');
        setProgress(0);
    };

    return (
        <div className="upload-container">
            <div className="upload-background"></div>
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card bg-dark text-white upload-card">
                            <div className="card-header border-0 bg-transparent">
                                <div className="d-flex align-items-center">
                                    <Film className="text-primary me-2" size={24} />
                                    <h2 className="mb-0">Upload Your Video</h2>
                                </div>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    {!selectedFile ? (
                                        <div
                                            className="upload-zone"
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                        >
                                            <FileVideo size={64} className="text-primary mb-4" />
                                            <h3 className="upload-title">Drag and drop your video here</h3>
                                            <p className="text-muted">or</p>
                                            <label className="btn btn-primary btn-lg mt-2">
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={handleVideoChange}
                                                    className="d-none"
                                                />
                                                Select Video
                                            </label>
                                            <p className="text-muted mt-3">
                                                Supported formats: MP4, WebM, MOV (max 2GB)
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="selected-file-container">
                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                <h4 className="mb-0">Selected Video</h4>
                                                <button
                                                    type="button"
                                                    className="btn btn-dark btn-sm"
                                                    onClick={clearSelection}
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>

                                            {/* Title Input */}
                                            <div className="mb-4">
                                                <label className="form-label">Video Title</label>
                                                <input
                                                    {...register('title', {
                                                        required: 'Title is required',
                                                        minLength: {
                                                            value: 3,
                                                            message: 'Title must be at least 3 characters'
                                                        }
                                                    })}
                                                    type="text"
                                                    className={`form-control bg-dark text-light border-secondary ${errors.title ? 'is-invalid' : ''
                                                        }`}
                                                    placeholder="Enter video title"
                                                />
                                                {errors.title && (
                                                    <div className="invalid-feedback">{errors.title.message}</div>
                                                )}
                                            </div>

                                            {/* Description Input */}
                                            <div className="mb-4">
                                                <label className="form-label">Description</label>
                                                <RichTextEditor
                                                    onChange={handleDescriptionChange}
                                                    placeholder="Add a description to your video..."
                                                />
                                                {errors.description && (
                                                    <div className="invalid-feedback">{errors.description.message}</div>
                                                )}
                                            </div>

                                            <VideoPreview url={previewUrl} />

                                            <div className="mt-4">
                                                <p className="mb-2">
                                                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                                </p>
                                                {uploading ? (
                                                    <UploadProgress progress={progress} />
                                                ) : (
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary btn-lg w-100"
                                                    >
                                                        <Upload className="me-2" size={20} />
                                                        Start Upload
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadVideo;