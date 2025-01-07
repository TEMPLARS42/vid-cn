import React, { useRef, useState } from 'react';
import { Upload, Film, FileVideo, X, Sparkles, StopCircle, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import UploadProgress from './UploadProgress';
import VideoPreview from './VideoPreview';
import RichTextEditor from './editor/RichTextEditor';
import { toasty } from '../../configs/toasty.config';

const UploadVideo = () => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [typedDescription, setTypedDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const typingIntervalRef = useRef(null);

    const {
        register,
        handleSubmit,
        reset,
        getValues,
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
        if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB
            setError('File size exceeds 2GB limit');
            return;
        }
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError('');
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelection(file);
        }
    };

    const handleDescriptionChange = (content) => {
        setTypedDescription(content);
    };

    const typeDescription = (fullText) => {
        let currentIndex = 0;
        const typingSpeed = 50;

        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
        }

        typingIntervalRef.current = setInterval(() => {
            setTypedDescription((prev) => prev + fullText.charAt(currentIndex));
            currentIndex++;

            if (currentIndex >= fullText.length) {
                clearInterval(typingIntervalRef.current);
                typingIntervalRef.current = null;
            }
        }, typingSpeed);
    };

    const generateDescription = async () => {
        try {
            if (!getValues('title').trim()) {
                toasty.warn("Please enter a title first");
                return;
            }
            setIsGenerating(true);
            setTypedDescription('');
            const response = await axios.post('/api/generate-description', {
                title: getValues('title')
            });
            typeDescription(response.data.description);
        } catch (error) {
            console.error(error);
            toasty.error(error?.response?.data?.message || "Failed to generate description");
            setIsGenerating(false);
        }
    };

    const stopGenerating = () => {
        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
            setIsGenerating(false);
        }
    };

    const onSubmit = async (data) => {
        if (!selectedFile) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('files', selectedFile);
            formData.append('data', JSON.stringify({
                ...data,
                description: typedDescription
            }));

            const response = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setProgress(percentCompleted);
                }
            });

            clearSelection();
            toasty.success(response.data.message || "Video uploaded successfully");
        } catch (error) {
            console.error(error);
            toasty.error(error?.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const clearSelection = () => {
        reset();
        setSelectedFile(null);
        setPreviewUrl('');
        setProgress(0);
        setTypedDescription('');
        setError('');
    };

    return (
        <div className="upload-container">
            <div className="upload-background" />
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
                                            className={`upload-zone ${error ? 'border-danger' : ''}`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                        >
                                            <FileVideo size={64} className={`mb-4 ${error ? 'text-danger' : 'text-primary'}`} />
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
                                            {error ? (
                                                <div className="text-danger mt-3 d-flex align-items-center gap-2">
                                                    <AlertCircle size={16} />
                                                    <span>{error}</span>
                                                </div>
                                            ) : (
                                                <p className="text-muted mt-3">
                                                    Supported formats: MP4, WebM, MOV (max 2GB)
                                                </p>
                                            )}
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

                                            <VideoPreview url={previewUrl} />

                                            <div className="mt-4">
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

                                                <div className="d-flex gap-2 mb-3">
                                                    <button
                                                        type="button"
                                                        onClick={generateDescription}
                                                        className="btn btn-outline-primary d-flex align-items-center gap-2"
                                                        disabled={isGenerating}
                                                    >
                                                        {isGenerating ? (
                                                            <>
                                                                <Loader2 className="animate-spin" size={18} />
                                                                Generating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Sparkles size={18} />
                                                                AI Generate
                                                            </>
                                                        )}
                                                    </button>
                                                    {isGenerating && (
                                                        <button
                                                            type="button"
                                                            onClick={stopGenerating}
                                                            className="btn btn-outline-danger d-flex align-items-center gap-2"
                                                        >
                                                            <StopCircle size={18} />
                                                            Stop
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="mb-4 position-relative">
                                                    <label className="form-label">Description</label>
                                                    {isGenerating && (
                                                        <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75" style={{ zIndex: 1 }}>
                                                            <div className="text-primary">
                                                                <Loader2 className="animate-spin" size={24} />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <RichTextEditor
                                                        onChange={handleDescriptionChange}
                                                        value={typedDescription}
                                                        placeholder="Add a description to your video..."
                                                    />
                                                </div>

                                                <p className="mb-2 text-secondary">
                                                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                                </p>

                                                {uploading ? (
                                                    <UploadProgress progress={progress} />
                                                ) : (
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                                                    >
                                                        <Upload size={20} />
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