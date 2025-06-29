import * as Yup from "yup";

export const categorySchema = Yup.object({
    name: Yup.string()
        .required("Tên danh mục là bắt buộc")
        .matches(/^\p{L}[\p{L}\d ]*$/u, "Tên danh mục phải bắt đầu bằng chữ cái và chỉ chứa chữ, số hoặc khoảng trắng")
})