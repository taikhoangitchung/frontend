import CreateExam from "../../create/page";

async function EditExam({params}) {
    const {id} = await params
    return <CreateExam id={id}/>;
}

export default EditExam;
