"use client"

import {useEffect, useState} from "react";
import style from "./styles.css";
import QuestionService from "../../../services/QuestionService";

const dataFixed = [
    {id: 1, content: "q1 ?", type: "multi-choice",answer:true},
    {id: 2, content: "q2 ?", type: "multi-choice",answer:false},
    {id: 3, content: "q3 ?", type: "choice",answer:true},
    {id: 4, content: "q4 ?", type: "choice",answer:false},
    {id: 5, content: "q5 ?", type: "choice",answer:false},
    {id: 6, content: "q6 ?", type: "multi-choice",answer:false},
    {id: 7, content: "q7 ?", type: "multi-choice",answer:false},
    {id: 8, content: "q8 ?", type: "choice",answer:true},
    {id: 9, content: "q9 ?", type: "multi-choice",answer:false},
    {id: 10, content: "q10 ?", type: "choice",answer:false},
];

const MyQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [isExpand, setIsExpand] = useState(-1);
    const questionPerPage = 5;

    useEffect(() => {
        setIsLoading(true);
        try {
            // const token = localStorage.getItem("token");
            // const payloadBase64 = token.split('.')[1];
            // if (!payloadBase64) throw new Error('Token không hợp lệ');
            //
            // const decodedPayload = atob(payloadBase64);
            // const payload = JSON.parse(decodedPayload);
            //
            // const userId = payload.user_id;
            //

            QuestionService.getAll(1)
                .then(res => {
                    setTotalPage(Math.ceil(res.data.length / questionPerPage));
                    const start = page === 1 ? 0 : (page - 1) * questionPerPage;
                    const end = start + questionPerPage;

                    const thisPageItems = res.data.slice(start, end);
                    setQuestions([...thisPageItems]);
                })
                .catch(err => console.log(err));
        } catch (error) {
            console.error('Lỗi khi giải mã token:', error.message);
        }

        setIsLoading(false);
    }, [page,]);

    const handlePrePage = () => {
        setPage(page - 1);
    }

    const handleNextPage = () => {
        setPage(page + 1);
    }

    const handleExpand = (e) => {
        setIsExpand(e.target.value === isExpand ? -1 : e.target.value);
    }

    if (isLoading) return <h1>Is Loading .....</h1>;

    return (
        <div className="list-container">
            <ul className="list">
                {questions.map(question => (
                    <li className="list-item" key={question.id} onClick={handleExpand} value={question.id}>
                        <div>
                            {/*<p>{question.id}</p>*/}
                            <p id={"content"}>{question.content}</p>
                            {/*<p>{question.type.name}</p>*/}
                        </div>
                        {isExpand === question.id && (
                            <ul type={"none"}>
                                {question.answers.map(answer => (
                                    <li key={answer.id}>{answer.correct ? "Correct" : "InCorrect"} - {answer.content}</li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
            <div className="pagination">
                {page !== 1 && <button onClick={handlePrePage}>Trang trước</button>}
                <button disabled={true}>{page}</button>
                {page !== totalPage && <button onClick={handleNextPage}>Trang tiếp</button>}
            </div>
        </div>
    );
}

export default MyQuestions;
