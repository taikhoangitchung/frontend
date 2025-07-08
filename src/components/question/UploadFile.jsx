import { Card } from "../ui/card";
import { validateImage } from "../../util/validateImage";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import SupabaseService from "../../services/SupabaseService";
import {supabaseConfig} from "../../config/supabaseConfig";

function UploadFile({ setImage,
                        setShowImageModal,
                        image }) {
    const [uploading, setUploading] = useState(false);

    const handleFile = async (file) => {
        if (!file || !validateImage(file)) return;
        setUploading(true);

        const uploadResult = await SupabaseService.uploadFile(file, supabaseConfig.bucketImageQuestion, supabaseConfig.buckImageQuestionPrefix);
        if (uploadResult) {
            console.log(uploadResult)
            setImage(uploadResult);
        }
        setUploading(false);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        await handleFile(file);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        await handleFile(file);
    };

    const removeFile = async () => {
        await SupabaseService.removeFile(image.path, supabaseConfig.bucketImageQuestion)
        setImage(null)
    }

    return (
        <Card className="bg-black/20 border-white/20 backdrop-blur-sm p-6 lg:col-span-3">
            <h3 className="text-white font-semibold text-lg">Upload hình ảnh</h3>

            {!image ? (
                <div
                    className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-white/50 hover:bg-white/5 transition-all duration-200 cursor-pointer h-[200px] flex flex-col justify-center"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}

                >
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer block">
                        <div className="w-12 h-6 text-white/70 mx-auto mb-3">📁</div>
                        <p className="text-white/80 mb-2">Chọn tệp</p>
                        <p className="text-white/60 text-sm">Kéo thả hoặc click để chọn ảnh</p>
                    </label>
                    {uploading && <p className="text-white/60 text-sm mt-2">Đang tải lên...</p>}
                </div>
            ) : (
                <div className="relative">
                    <div
                        className="border-2 border-white/30 rounded-lg p-4 bg-white/5 cursor-pointer hover:scale-105 transition-all duration-200"
                        onClick={() => setShowImageModal(true)}
                    >
                        <img
                            src={image?.preview || image?.url || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-[163px] object-cover rounded-lg"
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="font-semibold absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-all duration-200 cursor-pointer"
                        onClick={() => removeFile()}
                    >
                        ✕
                    </Button>
                </div>
            )}
        </Card>
    );
}

export default UploadFile;
