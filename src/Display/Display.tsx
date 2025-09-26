import { useState, useEffect } from "react";
import type { Chamada } from "../types/Chamada.tsx";
import {Box, Typography, Paper, Divider, List, ListItem, ListItemText, Button} from "@mui/material";

// Função pra abreviar nomes
const abreviarNome = (nome: string) => {
    const partes = nome.split(" ");
    if (partes.length === 1) return nome;
    return `${partes[0]} ${partes[partes.length - 1][0]}.`;}

// Componente principal (funcionamento do display)
export default function UserDisplay() {
    const [chamadaAtual, setChamadaAtual] = useState<Chamada | null>(null);
    const [ultimasChamadas, setUltimasChamadas] = useState<Chamada[]>([]);
    const [audioLiberado, setAudioLiberado] = useState(false);

    // Função de voz: checar se áudio liberado, se sim corta qualquer áudio em andamento e depois fala a chamada
    const falarChamada = (nome: string, sala: string) => {
        if (!audioLiberado) {
            console.log("Áudio não liberado. Aguardando interação do usuário.");
            return;
        }

        window.speechSynthesis.cancel();

        // Utterance significa "o que será falado"
        const utterance = new SpeechSynthesisUtterance(`Atenção, ${nome}, sala ${sala}`);
        utterance.lang = "pt-br";
        window.speechSynthesis.speak(utterance);
    }

    // Mantém o display atualizado com as chamadas do localStorage
    useEffect(() => {
        const atualizarChamadas = () => {
            const todasChamadas: Chamada[] = JSON.parse(localStorage.getItem("chamadas") || "[]");
            if (todasChamadas.length === 0) {
                setChamadaAtual(null);
                setUltimasChamadas([]);
                return;
            } else {
                const novaChamada = todasChamadas[0];
                setChamadaAtual((chamadaAnterior) => {
                    if (novaChamada.timestamp !== chamadaAnterior?.timestamp) {
                        falarChamada(novaChamada.nome, novaChamada.sala);
                        return novaChamada;
                    }
                    return chamadaAnterior;
                });
                setUltimasChamadas(todasChamadas.slice(1, 6));
            }
        };

        atualizarChamadas();
        window.addEventListener("storage", atualizarChamadas);

        return () => {
            window.removeEventListener("storage", atualizarChamadas);
        };
    }, [audioLiberado]);

    // Função chamada quando o usuário clica no botão para liberar áudio
    const handleLiberarAudio = () => {
        setAudioLiberado(true);
        const utterance = new SpeechSynthesisUtterance(" ");
        utterance.volume = 0;
        window.speechSynthesis.speak(utterance);
    };

    // Display inicial pedindo pro usuário liberar o áudio
    if (!audioLiberado) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#00532E",
          color: "white",
        }}
      >
        <Typography variant="h3" gutterBottom>
          Sistema de Chamada de Pacientes
        </Typography>
        <Typography variant="h5" sx={{ mb: 4 }}>
          Clique no botão abaixo para iniciar e ativar o áudio
        </Typography>
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={handleLiberarAudio}
        >
          Iniciar Tela de Chamadas
        </Button>
      </Box>
    );
  }

  // Display após liberação do áudio (mostra as chamadas pros usuários)
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#E8F5E9",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
        }}
      >
        <Typography variant="h3" fontWeight="bold" color="text.secondary">
          CHAMADA ATUAL
        </Typography>
      </Paper>

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {chamadaAtual ? (
          <Paper
            elevation={5}
            sx={{
              p: 4,
              width: "80%",
              backgroundColor: "primary.main",
              color: "white",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="h1"
                  component="div"
                  fontWeight="bold"
                  sx={{ animation: "blink 1.5s linear infinite" }}
                >
                  {chamadaAtual.nome.toUpperCase()}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h2" component="div" fontWeight="bold">
                  SALA: {chamadaAtual.sala}
                </Typography>
              </Box>
            </Box>
          </Paper>
        ) : (
          <Typography variant="h2" color="text.secondary">
            Aguardando chamada...
          </Typography>
        )}
      </Box>

      <Paper elevation={3} sx={{ p: 2, backgroundColor: "white" }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          color="text.secondary"
          align="center"
        >
          ÚLTIMAS CHAMADAS
        </Typography>
        <Divider sx={{ my: 1 }} />
        <List sx={{ marginX: 14 }}>
          {ultimasChamadas.map((chamada) => (
            <ListItem key={chamada.timestamp.getTime()}>
              <ListItemText
                primary={
                  <Typography variant="h5" component="span" fontWeight="500">
                    {abreviarNome(chamada.nome).toUpperCase()}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="h5"
                    component="span"
                    fontWeight="500"
                    sx={{ float: "right" }}
                  >
                    Sala {chamada.sala}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <style>
        {`
          @keyframes blink {
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </Box>
  );
}

