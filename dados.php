<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$host = "localhost";
$db   = "eqz_db";
$user = "root@localhost";
$pass = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Busca mensagem do autor de hoje
    $stmtAutor = $pdo->prepare("SELECT autor, data, texto FROM mensagens_autor ORDER BY data DESC LIMIT 1");
    $stmtAutor->execute();
    $msgAutor = $stmtAutor->fetch(PDO::FETCH_ASSOC);

    // 2. Monta a estrutura padrão igual ao seu JSON antigo
    $resposta = [
        "configAdm" => [
            "id" => "203077",
            "apelido" => "Andarilho"
        ],
        "mensagensDoAutor" => $msgAutor ? [
            "autor" => $msgAutor['autor'],
            "data" => $msgAutor['data'],
            "texto" => $msgAutor['texto']
        ] : null
    ];

    // Exemplo dinâmico para a data de hoje (ou você pode puxar todas as datas do banco)
    $dataHoje = date('Y-m-d');
    
    // Busca vídeo do dia
    $stmtVideo = $pdo->prepare("SELECT titulo, descricao, youtube_id FROM videos_dia WHERE data = ?");
    $stmtVideo->execute([$dataHoje]);
    $video = $stmtVideo->fetch(PDO::FETCH_ASSOC);

    // Busca mensagens do dia
    $stmtMensagens = $pdo->prepare("SELECT horario, texto, data_iso, reacao_coracao, reacao_amem, reacao_flor FROM mensagens_dia WHERE data_iso = ?");
    $stmtMensagens->execute([$dataHoje]);
    $mensagensDia = $stmtMensagens->fetchAll(PDO::FETCH_ASSOC);

    // Formata as reações para o padrão do JSON
    $mensagensFormatadas = [];
    foreach ($mensagensDia as $m) {
        $mensagensFormatadas[] = [
            "texto" => $m['texto'],
            "horario" => $m['horario'],
            "dataIso" => $m['data_iso'],
            "reacoes" => [
                "coracao" => (int)$m['reacao_coracao'],
                "amem" => (int)$m['reacao_amem'],
                "flor" => (int)$m['reacao_flor']
            ]
        ];
    }

    // Adiciona o dia atual na estrutura global
    $resposta[$dataHoje] = [
        "videoDoDia" => $video ? [
            "titulo" => $video['titulo'],
            "descricao" => $video['descricao'],
            "youtubeId" => $video['youtube_id']
        ] : null,
        "resumoDiario" => [
            "data" => date('d/m/Y')
        ],
        "mensagensDoDia" => $mensagensFormatadas
    ];

    echo json_encode($resposta, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro na conexão com o banco: " . $e->getMessage()]);
}
?>