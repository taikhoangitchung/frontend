import {supabaseConfig} from "../../config/supabaseConfig";
import SupabaseService from "../../services/SupabaseService";

export const moveFileImage = async (image) => {
    const currentPathFile = image.path;
    const fileName = currentPathFile.split("/").pop();
    const newPathFile = `${supabaseConfig.buckImageQuestionPrefixFinal}/${fileName}`;

    const { error } = await SupabaseService.moveImage(
        supabaseConfig.bucketImageQuestion,
        currentPathFile,
        newPathFile
    );

    if (error) throw new Error("Di chuyển ảnh thất bại");
    return newPathFile;
}