import React from "react";

const EmailTemplate = ({resetLink}) => {
    return (
        <html>
        <body>
        <div style={{fontFamily: "Arial", textAlign: "center", padding: 20}}>
            <h2>Yêu cầu đặt lại mật khẩu</h2>
            <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p>Nhấn nút bên dưới để tiến hành đặt lại mật khẩu:</p>

            <div style={{marginTop: "30px"}}>
                <a
                    href={resetLink}
                    style={{textDecoration: "none"}}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <button className={"bg-black text-white"}>Reset Password</button>
                </a>

            </div>

            <p style={{marginTop: "50px", color: "gray", fontSize: 14}}>
                Nếu bạn không yêu cầu, vui lòng bỏ qua email này.
            </p>
        </div>
        </body>
        </html>
    );
};

export default EmailTemplate;
