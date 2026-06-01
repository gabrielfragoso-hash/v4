import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return new NextResponse("Acesso restrito", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="V4 Estruturação IA"',
      },
    });
  }

  const base64 = authHeader.slice("Basic ".length);
  const decoded = Buffer.from(base64, "base64").toString("utf-8");
  const colonIndex = decoded.indexOf(":");
  const username = decoded.slice(0, colonIndex);
  const password = decoded.slice(colonIndex + 1);

  const validUser = process.env.AUTH_USERNAME;
  const validPass = process.env.AUTH_PASSWORD;

  if (username !== validUser || password !== validPass) {
    return new NextResponse("Credenciais inválidas", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="V4 Estruturação IA"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
