import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

interface UploadSectionProps {
    onUploadComplete: (newJdId?: number) => void;
    selectedJdId: number | null;
    isCreateMode?: boolean;
}

export default function UploadSection({ onUploadComplete, selectedJdId, isCreateMode = false }: UploadSectionProps) {
    const [uploading, setUploading] = useState(false);
    const [jdFile, setJdFile] = useState<File | null>(null);
    const [resumeFiles, setResumeFiles] = useState<File[]>([]);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const onDropResumes = useCallback((acceptedFiles: File[]) => {
        setResumeFiles((prev) => [...prev, ...acceptedFiles]);
    }, []);

    const onDropJD = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setJdFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps: getResumeRootProps, getInputProps: getResumeInputProps, isDragActive: isResumeDragActive } = useDropzone({
        onDrop: onDropResumes,
        accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] },
        disabled: selectedJdId === null && !jdFile // Disable if no JD selected and no new JD being uploaded
    });

    const { getRootProps: getJDRootProps, getInputProps: getJDInputProps, isDragActive: isJDDragActive } = useDropzone({
        onDrop: onDropJD,
        maxFiles: 1,
        accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] }
    });

    const handleUpload = async () => {
        if (!jdFile && resumeFiles.length === 0) {
            setStatus({ type: 'error', message: 'Please select files to upload.' });
            return;
        }

        if (!isCreateMode && resumeFiles.length > 0 && selectedJdId === null && !jdFile) {
            setStatus({ type: 'error', message: 'Please select a Job Role or upload a new JD first.' });
            return;
        }

        setUploading(true);
        setStatus(null);

        try {
            let currentJdId = selectedJdId;

            // Upload JD
            if (jdFile) {
                const formData = new FormData();
                formData.append('file', jdFile);
                const response = await api.post('/upload/jd', formData);
                currentJdId = response.data.id;
            }

            // Upload Resumes (Skip if in Create Mode)
            if (!isCreateMode && resumeFiles.length > 0 && currentJdId) {
                const formData = new FormData();
                resumeFiles.forEach((file) => formData.append('files', file));
                // Pass jd_id as query param
                await api.post(`/upload/resumes?jd_id=${currentJdId}`, formData);
            }

            // Trigger Scoring (Skip if in Create Mode, or maybe score if just JD uploaded? No, need resumes)
            if (!isCreateMode && currentJdId && resumeFiles.length > 0) {
                await api.post(`/score?jd_id=${currentJdId}`);
            }

            setStatus({ type: 'success', message: isCreateMode ? 'Role created successfully!' : 'Files uploaded and analysis complete!' });
            setJdFile(null);
            setResumeFiles([]);

            // Delay slightly to show success message before closing modal if in create mode
            if (isCreateMode) {
                setTimeout(() => onUploadComplete(currentJdId || undefined), 1000);
            } else {
                onUploadComplete(currentJdId || undefined);
            }

        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Upload failed. Please try again.' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`grid grid-cols-1 ${isCreateMode || selectedJdId ? '' : 'md:grid-cols-2'} gap-6 mb-8`}>
            {/* JD Upload - Show only if creating new role or no role selected */}
            {(!selectedJdId || isCreateMode) && (
                <Card className="border-dashed border-2 hover:border-primary transition-colors">
                    <CardHeader>
                        <CardTitle className="text-lg">Job Description</CardTitle>
                        <CardDescription>Upload the JD to {isCreateMode ? 'create a new role' : 'score against'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            {...getJDRootProps()}
                            className={`h-40 flex flex-col items-center justify-center rounded-md bg-muted/50 cursor-pointer transition-colors ${isJDDragActive ? 'bg-primary/10' : ''
                                }`}
                        >
                            <input {...getJDInputProps()} />
                            {jdFile ? (
                                <div className="flex flex-col items-center text-primary">
                                    <FileText className="w-10 h-10 mb-2" />
                                    <p className="text-sm font-medium">{jdFile.name}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-muted-foreground">
                                    <Upload className="w-10 h-10 mb-2" />
                                    <p className="text-sm">Drag & drop JD here</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Resumes Upload - Hide in Create Mode */}
            {!isCreateMode && (
                <Card className="border-dashed border-2 hover:border-primary transition-colors">
                    <CardHeader>
                        <CardTitle className="text-lg">Resumes</CardTitle>
                        <CardDescription>Upload candidate resumes (PDF/DOCX)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            {...getResumeRootProps()}
                            className={`h-40 flex flex-col items-center justify-center rounded-md bg-muted/50 cursor-pointer transition-colors ${isResumeDragActive ? 'bg-primary/10' : ''
                                }`}
                        >
                            <input {...getResumeInputProps()} />
                            {resumeFiles.length > 0 ? (
                                <div className="flex flex-col items-center text-primary">
                                    <FileText className="w-10 h-10 mb-2" />
                                    <p className="text-sm font-medium">{resumeFiles.length} files selected</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-muted-foreground">
                                    <Upload className="w-10 h-10 mb-2" />
                                    <p className="text-sm">Drag & drop resumes here</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className={`col-span-1 ${isCreateMode || selectedJdId ? '' : 'md:col-span-2'} flex flex-col items-center gap-4`}>
                <Button size="lg" onClick={handleUpload} disabled={uploading || (!jdFile && resumeFiles.length === 0)}>
                    {uploading ? 'Processing...' : (isCreateMode ? 'Create Role' : 'Analyze Candidates')}
                </Button>

                <AnimatePresence>
                    {status && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex items-center gap-2 text-sm font-medium ${status.type === 'success' ? 'text-green-600' : 'text-red-600'
                                }`}
                        >
                            {status.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {status.message}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
