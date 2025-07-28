export interface IPASSWORD_RECOVERY_TEMPLATE {
  username: string;
  token: string;
}

export const PASSWORD_RECOVERY_TEMPLATE = /* html */ `<body>
  <link
    href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400&display=swap"
    rel="stylesheet"
  />
  <table
    style="
      font-family: 'Source Sans Pro', sans-serif;
      margin: 0 auto;
      width: 100%;
      max-width: 780px;
      border-collapse: collapse;
      background-color: #f7f8fb;
    "
  >
    <tbody>
      <tr>
        <td style="padding: 30px; text-align: center">
          <img
            style="transform: scale(0.6)"
            src="https://ramax-public.s3.us-east-1.amazonaws.com/RAMAX-Group_Horizontal_Cor.png"
            alt="Logotipo Ramax"
            width="240"
          />
        </td>
      </tr>
      <tr>
        <td>
          <table
            style="
              margin: 0 auto;
              width: calc(100% - 40px);
              border-collapse: collapse;
              background-color: #ffffff;
            "
          >
            <tr>
              <td style="padding: 30px; border-top: 3px solid #3e63dd">
                <h2 style="font-size: 24px; text-align: left; color: #343642">
                  Olá {{username}},
                </h2>
                <p style="font-size: 16px; text-align: left; color: #343642">
                  Use o TOKEN abaixo para redefinir sua senha:
                </p>

                <p style="font-size: 30px; text-align: left; color: #343642">
                  {{token}}
                </p>
                <p style="font-size: 16px; text-align: left; color: #343642">
                  Se não quiser alterar a senha ou não tiver feito essa
                  solicitação, basta ignorar/excluir esta mensagem.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px; text-align: center">
          <p
            style="
              font-size: 16px;
              text-align: left;
              color: #7b868e;
              margin: 8px;
              text-align: center;
            "
          >
            Política de privacidade • Preferências de E-mail
          </p>
        </td>
      </tr>
    </tbody>
  </table>
</body>
`;
