import React from 'react';
import { Box, Typography, Button, Link } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../redux/cartSlice';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Icono para el mensaje de confirmación
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useEstablecimiento } from '../../App'; // Importa el contexto

const SuccessPage = () => {
  const { establecimiento, logoUrl, whatsappUrl } = useEstablecimiento(); // Obtén la URL del logo del contexto
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { name } = location.state || { name: 'Cliente' };

  const whatsappMessage = "Hola, acabo de hacer un pedido en Madriguera y me gustaría obtener más información sobre mi orden. ¡Gracias!";
  const whatsappNumber = "+573183351733";

  const handleContactSupport = () => {
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappURL, '_blank');
  };

  const handleReturnToShop = () => {
    dispatch(clearCart());  // Vacía el carrito de compras
    navigate(`/${establecimiento}`);  // Redirige a la página principal de la tienda
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', backgroundColor: '#f3f4f6' }}>
      <Box sx={{ p: 4, maxWidth: 400, mx: 'auto', borderRadius: 2, boxShadow: 3, backgroundColor: '#fff' }}>
        <img src={logoUrl} alt="Logo de la empresa" style={{ maxWidth: '220px', marginBottom: '10px' }} />
        <Typography variant="h4" gutterBottom style={{ color: '#4CAF50' }}>
          <CheckCircleOutlineIcon style={{ verticalAlign: 'middle', fontSize: '1.5em' }} /> Pedido Confirmado
        </Typography>
        <Typography variant="h6" sx={{ mb: 4 }}>
          ¡El pedido de {name} ha quedado confirmado y procedera al area de facturacion.
        </Typography>
        <Link
          component="button"
          variant="body2"
          sx={{ textDecoration: 'underline', cursor: 'pointer', color: 'black', mb: 2 }}
          onClick={handleReturnToShop}
        >
          Regresa al comercio
        </Link>
      </Box>
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'gray' }}>
          Developed by
        </Typography>
        <img src="https://storage.googleapis.com/comprobantes-madriguera/logo-zeendr.png" alt="Logo de la casa matriz" style={{ width: 100, marginTop: '8px' }} />
      </Box>
    </Box>
  );
};

export default SuccessPage;


