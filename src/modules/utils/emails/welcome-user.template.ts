export interface IWELCOME_USER_TEMPLATE {
  username: string;
  email: string;
  defaultPassword: string;
}

export const WELCOME_USER_TEMPLATE = /** html */ `
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
    <table
      width="100%"
      border="0"
      cellspacing="0"
      cellpadding="0"
    >
      <tr>
        <td align="center" style="padding-top: 20px; padding-bottom: 20px;">
          <table
            width="600"
            border="0"
            cellspacing="0"
            cellpadding="0"
            style="background-color: #fff; border-radius: 8px; overflow: hidden"
          >
            <tr>
              <td align="center" style="padding: 30px 20px 10px 20px">
                <img
                  style="transform: scale(0.6)"
                  src="https://ramax-public.s3.us-east-1.amazonaws.com/RAMAX-Group_Horizontal_Cor.png"
                  alt="Logotipo Ramax"
                  width="240"
                />
              </td>
            </tr>

            <tr>
              <td style="padding: 30px; border-top: 3px solid #3e63dd">
                <h2
                  style="font-size: 20px; font-weight: 600; margin: 0 0 10px 0"
                >
                  Bem-vindo {{username}}!
                </h2>
                <p
                  style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0"
                >
                  Você obteve acesso à plataforma MIS da RAMAX GROUP. Veja
                  abaixo as formas de acessar a plataforma:
                </p>

                <p
                  style="font-size: 14px; line-height: 1.6; margin: 0 0 10px 0"
                >
                  <strong>E-mail:</strong> {{email}}<br />
                  <strong>Senha padrão:</strong> {{defaultPassword}}
                </p>

                <div style="text-align: center; margin: 30px 0">
                  <a
                    href="https:mis.ramax-group.net/login"
                    target="_blank"
                    rel="noreferrer"
                    style="
                      background-color: #3162da;
                      color: #fff;
                      text-decoration: none;
                      padding: 12px 24px;
                      border-radius: 6px;
                      font-weight: bold;
                      font-size: 14px;
                      display: inline-block;
                    "
                  >
                    CLIQUE AQUI PARA ACESSAR
                  </a>
                </div>

                <p
                  style="
                    font-size: 12px;
                    line-height: 1.5;
                    color: #555;
                    margin: 0 0 20px 0;
                  "
                >
                  <strong>Obs:</strong> Recomendamos que você altere sua senha imediatamente para uma nova senha pessoal e segura. 
                  (A equipe da RAMAX não tem acesso à sua senha atual.)
                  Para redefinir, clique em “Esqueci minha senha” na plataforma e siga as instruções exibidas.
                </p>

                <p
                  style="
                    font-size: 12px;
                    line-height: 1.5;
                    color: #555;
                    margin: 0;
                  "
                >
                  Esse é um e-mail automático gerado após criarem um cadastro
                  para seu usuário. Não é necessário obrigatoriamente acessar o
                  link ao ver esse e-mail.
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
                <span
                  style="color: #999; text-decoration: none"
                  >Política de privacidade</span
                >
                •
                <span
                  style="color: #999; text-decoration: none"
                  >Preferências de E-mail</span
                >
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

`;
