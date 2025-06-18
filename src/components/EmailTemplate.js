import React from "react";
import {Button} from "./ui/button";

const EmailTemplate = ({data, title, description, openButton}) => {
    return (
        <html>
        <body>
        <div style={{fontFamily: "Arial", textAlign: "center", padding: 20}}>
            <h2>{title}</h2>
            <pre>{description}</pre>

            <div style={{marginTop: "30px"}}>
                {openButton ? (
                    <a
                        href={data}
                        style={{textDecoration: "none"}}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <button className={"bg-black text-white"}>Reset Password</button>
                    </a>
                ) : <p>{data}</p>
                }
            </div>
        </div>
        </body>
        </html>
    );
};

export default EmailTemplate;
