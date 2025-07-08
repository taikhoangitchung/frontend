import {supabaseConfig} from "../config/supabaseConfig";

export const getSupabaseImageUrl = (bucket, path) =>
    `${supabaseConfig.supabaseAppUrl}/storage/v1/object/public/${bucket}/${path}`;