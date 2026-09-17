import express from 'express';
import { app } from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`EDUKA Production Backend listening on port ${PORT}`);
});
