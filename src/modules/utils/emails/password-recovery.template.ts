export interface IPASSWORD_RECOVERY_TEMPLATE {
  username: string;
  token: string;
}

export const PASSWORD_RECOVERY_TEMPLATE = /* html */ `
<!DOCTYPE html>
<html lang="pt-BR">
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
      font-family: Arial, Helvetica, sans-serif;
      color: #333;
    "
  >
    <link
      href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400&display=swap"
      rel="stylesheet"
    />
    <table
      width="100%"
      border="0"
      cellspacing="0"
      cellpadding="0"
      style="background-color: #f5f5f5;"
    >
      <tr>
        <!-- padding seguro aplicado aqui -->
        <td align="center" style="padding: 20px 0;">
          <table
            width="600"
            border="0"
            cellspacing="0"
            cellpadding="0"
            style="
              max-width: 600px;
              border-collapse: collapse;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
            "
          >
            <tr>
              <td style="padding: 30px; text-align: center;">
                <img
                  style="transform: scale(0.6);"
                  src="https://ramax-public.s3.us-east-1.amazonaws.com/RAMAX-Group_Horizontal_Cor.png"
                  alt="Logotipo Ramax"
                  width="240"
                />
              </td>
            </tr>

            <tr>
              <td style="padding: 30px; border-top: 3px solid #3e63dd;">
                <h2 style="font-size: 20px; text-align: left; color: #343642;">
                  Olá {{username}},
                </h2>

                <p style="font-size: 14px; text-align: left; color: #343642;">
                  Use o TOKEN abaixo para seguir com a sua redefinição de senha:
                </p>

                <p style="font-size: 24px; text-align: left; color: #343642; font-weight: bold;">
                  {{token}}
                </p>

                <p style="font-size: 12px; text-align: left; color: #343642;">
                  Obs: Se não quiser alterar a senha ou não tiver feito essa
                  solicitação, basta ignorar/excluir esta mensagem.
                </p>
              </td>
            </tr>

            <tr>
              <td
                align="center"
                style="
                  padding: 20px;
                  font-size: 14px;
                  color: #999;
                  background-color: #fafafa;
                  border-top: 1px solid #eee;
                "
              >
                <span style="color: #999; text-decoration: none;">
                  Política de privacidade
                </span>
                •
                <span style="color: #999; text-decoration: none;">
                  Preferências de E-mail
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
