import { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    Stepper,
    Step,
    StepLabel,
    MenuItem,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import "./styles.css";
import { db, storage } from "../../services/FirebaseConfig"; // ajuste o caminho conforme seu projeto
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


export default function RegisterImovel() {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({
        nome: "",
        contato: "",
        email: "",
        finalidade: "",
        tipo: "",
        condominio: "",
        valorCondominio: "",
        vendaOuLocacao: "",
        endereco: "",
        metros: "",
        dormitorios: "",
        suites: "",
        vagasCobertas: "",
        vagasDescobertas: "",
        imagens: [],
        aceitaFinanciamento: false,
    });

    const steps = ["Informações Pessoais", "Detalhes do Imóvel", "Imagens e Financiamento"];

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === "checkbox") {
            setFormData({ ...formData, [name]: checked });
        } else if (type === "file") {
            setFormData({ ...formData, imagens: Array.from(files) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            // Upload das imagens
            const imageUrls = await Promise.all(
                formData.imagens.map(async (image) => {
                    const imageRef = ref(storage, `imoveis/${Date.now()}-${image.name}`);
                    await uploadBytes(imageRef, image);
                    return await getDownloadURL(imageRef);
                })
            );

            // Enviar dados para o Firestore
            await addDoc(collection(db, "imoveis"), {
                nome: formData.nome,
                contato: formData.contato,
                email: formData.email,
                finalidade: formData.finalidade,
                tipo: formData.tipo,
                condominio: formData.condominio,
                valorCondominio: formData.valorCondominio || null,
                vendaOuLocacao: formData.vendaOuLocacao,
                endereco: formData.endereco,
                metros: formData.metros,
                dormitorios: formData.dormitorios,
                suites: formData.suites,
                vagasCobertas: formData.vagasCobertas,
                vagasDescobertas: formData.vagasDescobertas,
                aceitaFinanciamento: formData.aceitaFinanciamento,
                imagens: imageUrls,
                createdAt: new Date(),
            });

            setMessage("Imóvel cadastrado com sucesso!");
            setFormData({
                nome: "",
                contato: "",
                email: "",
                finalidade: "",
                tipo: "",
                condominio: "",
                valorCondominio: "",
                vendaOuLocacao: "",
                endereco: "",
                metros: "",
                dormitorios: "",
                suites: "",
                vagasCobertas: "",
                vagasDescobertas: "",
                imagens: [],
                aceitaFinanciamento: false,
            });
            setActiveStep(0);
        } catch (error) {
            console.error(error);
            setMessage("Erro ao cadastrar imóvel.");
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <>
                        <TextField label="Nome" name="nome" fullWidth margin="normal" value={formData.nome} onChange={handleChange} required />
                        <TextField label="Contato" name="contato" fullWidth margin="normal" value={formData.contato} onChange={handleChange} required />
                        <TextField label="E-mail" name="email" fullWidth margin="normal" value={formData.email} onChange={handleChange} required />
                    </>
                );

            case 1:
                return (
                    <>
                        <TextField
                            select
                            label="Finalidade"
                            name="finalidade"
                            fullWidth
                            margin="normal"
                            value={formData.finalidade}
                            onChange={handleChange}
                            required
                        >
                            <MenuItem value="Venda">Venda</MenuItem>
                            <MenuItem value="Locação">Locação</MenuItem>
                        </TextField>

                        <TextField
                            label="Tipo de imóvel"
                            name="tipo"
                            fullWidth
                            margin="normal"
                            value={formData.tipo}
                            onChange={handleChange}
                            required
                        />

                        <TextField
                            label="Condomínio"
                            name="condominio"
                            fullWidth
                            margin="normal"
                            value={formData.condominio}
                            onChange={handleChange}
                        />

                        {formData.condominio && (
                            <TextField
                                label="Valor do condomínio"
                                name="valorCondominio"
                                fullWidth
                                margin="normal"
                                type="number"
                                value={formData.valorCondominio}
                                onChange={handleChange}
                            />
                        )}

                        <TextField
                            select
                            label="Venda ou Locação"
                            name="vendaOuLocacao"
                            fullWidth
                            margin="normal"
                            value={formData.vendaOuLocacao}
                            onChange={handleChange}
                            required
                        >
                            <MenuItem value="Venda">Venda</MenuItem>
                            <MenuItem value="Locação">Locação</MenuItem>
                        </TextField>

                        <TextField label="Endereço" name="endereco" fullWidth margin="normal" value={formData.endereco} onChange={handleChange} required />
                        <TextField label="Metros quadrados" name="metros" type="number" fullWidth margin="normal" value={formData.metros} onChange={handleChange} />
                        <TextField label="Dormitórios" name="dormitorios" type="number" fullWidth margin="normal" value={formData.dormitorios} onChange={handleChange} />
                        <TextField label="Suítes" name="suites" type="number" fullWidth margin="normal" value={formData.suites} onChange={handleChange} />
                        <TextField label="Vagas cobertas" name="vagasCobertas" type="number" fullWidth margin="normal" value={formData.vagasCobertas} onChange={handleChange} />
                        <TextField label="Vagas descobertas" name="vagasDescobertas" type="number" fullWidth margin="normal" value={formData.vagasDescobertas} onChange={handleChange} />
                    </>
                );

            case 2:
                return (
                    <>
                        <Button variant="contained" component="label" sx={{ mt: 2 }}>
                            Anexar imagens
                            <input type="file" name="imagens" hidden multiple accept="image/*" onChange={handleChange} />
                        </Button>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.aceitaFinanciamento}
                                    onChange={handleChange}
                                    name="aceitaFinanciamento"
                                />
                            }
                            label="Aceita financiamento?"
                            sx={{ mt: 3 }}
                        />
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <Box sx={{ maxWidth: 600, margin: "auto", p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Cadastrar Imóvel
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <form onSubmit={handleSubmit}>
                {renderStepContent(activeStep)}

                <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                    {activeStep > 0 && (
                        <Button variant="outlined" onClick={handleBack}>
                            Voltar
                        </Button>
                    )}

                    {activeStep < steps.length - 1 ? (
                        <Button variant="contained" onClick={handleNext}>
                            Próximo
                        </Button>
                    ) : (
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? "Enviando..." : "Concluir"}
                        </Button>
                    )}
                </Box>
            </form>

            {message && (
                <Typography sx={{ mt: 2 }} color={message.includes("sucesso") ? "green" : "red"}>
                    {message}
                </Typography>
            )}
        </Box>
    );
}
