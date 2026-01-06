import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Play, Loader2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";


export default function InfiniteTalkHome() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAudioFile(e.target.files[0]);
        }
    };

    const handleGenerate = async () => {
        if (!imageFile || !audioFile) {
            toast({
                title: "Missing files",
                description: "Please upload both an image and an audio file.",
                variant: "destructive",
            });
            return;
        }

        setIsGenerating(true);
        setGeneratedVideoUrl(null);

        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('audio', audioFile);

        try {
            // We use fetch directly because we need blob response for video
            // The Nginx proxy forwards /api/infinitetalk/generate to the service
            const response = await fetch('/api/infinitetalk/generate', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Generation failed');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setGeneratedVideoUrl(url);

            toast({
                title: "Success!",
                description: "Video generated successfully.",
            });

        } catch (error: any) {
            console.error("Generation error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to generate video. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8 font-sans text-foreground relative">
            {/* Maintenance Overlay */}
            <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <Card className="max-w-md w-full border-destructive/50 shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
                            <Video className="w-8 h-8 text-destructive" />
                        </div>
                        <CardTitle className="text-xl text-destructive">Service Temporarily Unavailable</CardTitle>
                        <CardDescription className="text-base pt-2">
                            Avatar Studio is currently down. Please reach out to the admin. It will be available based on requirement only.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center pb-6">
                        <Button variant="outline" onClick={() => navigate('/')}>
                            Return to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="max-w-4xl mx-auto space-y-8 opacity-20 pointer-events-none">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Avatar Studio</h1>
                        <p className="text-muted-foreground">Generate talking head videos from image and audio.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Input</CardTitle>
                            <CardDescription>Upload your source files</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="image-upload">Portrait Image</Label>
                                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                                    <Input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleImageChange}
                                    />
                                    {imageFile ? (
                                        <div className="relative w-full aspect-square max-w-[200px]">
                                            <img
                                                src={URL.createObjectURL(imageFile)}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-md"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate rounded-b-md">
                                                {imageFile.name}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground">Click to upload image</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="audio-upload">Audio File</Label>
                                <div className="border rounded-md p-3 flex items-center gap-3">
                                    <Input
                                        id="audio-upload"
                                        type="file"
                                        accept="audio/*"
                                        onChange={handleAudioChange}
                                    />
                                </div>
                                {audioFile && (
                                    <p className="text-xs text-muted-foreground mt-1">Selected: {audioFile.name}</p>
                                )}
                            </div>

                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleGenerate}
                                disabled={true}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Generate Video
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Output Section */}
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Output</CardTitle>
                            <CardDescription>Generated video result</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
                            {generatedVideoUrl ? (
                                <div className="w-full space-y-4">
                                    <video
                                        src={generatedVideoUrl}
                                        controls
                                        className="w-full rounded-lg border shadow-sm"
                                        autoPlay
                                    />
                                    <Button variant="outline" className="w-full" asChild>
                                        <a href={generatedVideoUrl} download="infinitetalk_video.mp4">
                                            Download Video
                                        </a>
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    <Video className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Generated video will appear here</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
