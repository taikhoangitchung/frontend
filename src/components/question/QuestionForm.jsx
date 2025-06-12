import React, { useState } from "react";
import {
    Box,
    TextField,
    Button,
    Typography,
    IconButton,
    Card,
    CardContent,
    Radio,
    Checkbox,
} from "@mui/material";
import { AddPhotoAlternate, Delete } from "@mui/icons-material";

const optionsData = [
    { id: 1, label: "Q", color: "#1976d2" }, // Blue
    { id: 2, label: "Type answer option here", color: "#009688" }, // Teal
    { id: 3, label: "Type answer option here", color: "#fbc02d" }, // Yellow
    { id: 4, label: "Type answer option here", color: "#d32f2f" }, // Red
];

const QuestionForm = () => {
    const [options, setOptions] = useState(optionsData);
    const [isMultiple, setIsMultiple] = useState(false);

    const handleDelete = (id) => {
        setOptions(options.filter((option) => option.id !== id));
    };

    return (
        <Box sx={{ width: 400, p: 2 }}>
            <TextField
                fullWidth
                variant="outlined"
                label="Type question here"
                sx={{ mb: 2 }}
            />
            {options.map((option) => (
                <Card key={option.id} sx={{ mb: 2, backgroundColor: option.color }}>
                    <CardContent sx={{ display: "flex", alignItems: "center" }}>
                        {isMultiple ? (
                            <Checkbox sx={{ color: "white" }} />
                        ) : (
                            <Radio sx={{ color: "white" }} />
                        )}
                        <Typography sx={{ flexGrow: 1, color: "white" }}>
                            {option.label}
                        </Typography>
                        <IconButton color="inherit">
                            <AddPhotoAlternate />
                        </IconButton>
                        <IconButton color="inherit" onClick={() => handleDelete(option.id)}>
                            <Delete />
                        </IconButton>
                    </CardContent>
                </Card>
            ))}
            <Box sx={{ display: "flex", gap: 2 }}>
                <Button variant={isMultiple ? "contained" : "outlined"} onClick={() => setIsMultiple(false)}>
                    Single correct answer
                </Button>
                <Button variant={isMultiple ? "outlined" : "contained"} onClick={() => setIsMultiple(true)}>
                    Multiple correct answers
                </Button>
            </Box>
        </Box>
    );
};

export default QuestionForm;
