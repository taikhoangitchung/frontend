import {v4 as uuidv4} from "uuid";
import {supabase} from "../lib/supabase";
import {toast} from "sonner";

class SupabaseService {
    static async uploadFile(file, bucket, pathPrefix) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${pathPrefix}/${fileName}`;

        const { error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (error) {
            toast.error("Upload failed!");
            return;
        }

        const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return {
            file,
            preview: URL.createObjectURL(file),
            path: filePath,
            url: publicUrlData.publicUrl,
            bucket,
        };
    }

    // remove file
    static async removeFile(path, bucket) {
        await supabase.storage.from(bucket).remove(path)
    }

    static async moveImage(bucket, oldPath, newPath) {
        const { error: copyErr } = await supabase.storage.from(bucket).copy(oldPath, newPath);
        if (copyErr) throw new Error("Copy failed");

        const { error: delErr } = await supabase.storage.from(bucket).remove([oldPath]);
        if (delErr) throw new Error("Delete failed");

        return newPath;
    }
}

export default SupabaseService;