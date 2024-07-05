import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField, Paper, Divider, CircularProgress, Backdrop, useTheme, MenuItem } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../../redux/cartSlice';
import { useEstablecimiento } from '../../App';
import Autocomplete from '@mui/material/Autocomplete';

const CheckoutPage = () => {
  const { establecimiento } = useEstablecimiento();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [comercialID, setComercialID] = useState('');
  const [nit, setNit] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [clientes, setClientes] = useState([]);
  const [descuento, setDescuento] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    if (name || nit) {
      buscarClientes(name, nit);
    }
  }, [name, nit]);

  const buscarClientes = async (nombre, nit) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/clientes/buscar`, {
        params: {
          establecimiento,
          nombre,
          nit,
        },
      });
      setClientes(response.data);
    } catch (error) {
      console.error('Error al buscar clientes:', error);
    }
  };

  const handleSelectCliente = async (event, value) => {
    if (value) {
      setName(value.nombre);
      setPhone(value.telefono);
      setEmail(value.correo);
      setNit(value.nit);

      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/clientes/detalles`, {
          params: {
            establecimiento,
            nombre: value.nombre,
            nit: value.nit
          }
        });
        if (response.data.lista_precios) {
          setDescuento(response.data.lista_precios.descuento);
        } else {
          setDescuento(0);
        }
      } catch (error) {
        console.error('Error al obtener detalles del cliente:', error);
      }
    }
  };

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity * (1 - descuento / 100)), 0);
  };

  const validateForm = () => {
    let valid = true;
    let errors = {};

    if (!name) {
      valid = false;
      errors.name = 'El nombre es requerido';
    }
    if (!email) {
      valid = false;
      errors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      valid = false;
      errors.email = 'El correo electrónico no es válido';
    }
    if (!phone) {
      valid = false;
      errors.phone = 'El número de teléfono es requerido';
    } else if (!/^\d{10}$/.test(phone)) {
      valid = false;
      errors.phone = 'El número de teléfono debe tener 10 dígitos';
    }
    if (!comercialID) {
      valid = false;
      errors.comercialID = 'El ID del comercial es requerido';
    }

    setErrors(errors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const formData = {
      nombre_completo: name,
      numero_telefono: phone,
      correo_electronico: email,
      productos: JSON.stringify(cartItems.map(item => ({
        ...item,
        price: item.price * (1 - descuento / 100)
      }))),
      comercial_id: comercialID,
      nit,
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/pedido?establecimiento=${encodeURIComponent(establecimiento)}`, formData);

      if (response.status === 201) {
        dispatch(clearCart());
        navigate(`/${establecimiento}/success`, { state: { name } });
      }
    } catch (error) {
      console.error('Error al enviar el pedido:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueShopping = () => {
    navigate(`/${establecimiento}`);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Paper elevation={0} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4, borderRadius: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información del Pedido
      </Typography>
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Autocomplete
          options={clientes}
          getOptionLabel={(option) => `${option.nombre} - ${option.nit}`}
          onChange={handleSelectCliente}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar Cliente por Nombre o NIT"
              variant="outlined"
              value={name || nit}
              onChange={(e) => {
                setName(e.target.value);
                setNit(e.target.value);
              }}
            />
          )}
        />
        <TextField
          label="NIT (opcional)"
          variant="outlined"
          value={nit}
          onChange={(e) => setNit(e.target.value)}
          error={!!errors.nit}
          helperText={errors.nit}
        />
        <TextField
          label="ID del Comercial"
          variant="outlined"
          value={comercialID}
          onChange={(e) => setComercialID(e.target.value)}
          error={!!errors.comercialID}
          helperText={errors.comercialID}
        />
        <TextField
          label="Número de Teléfono"
          variant="outlined"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={!!errors.phone}
          helperText={errors.phone}
        />
        <TextField
          label="Nombre y Apellido"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
        />
        <TextField
          label="Correo Electrónico"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
        />
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>
          Resumen del Pedido
        </Typography>
        <Box sx={{ mb: 2 }}>
          {cartItems.map((item) => (
            <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body1">{item.quantity} x {item.name}</Typography>
              <Typography variant="body1">{formatCurrency(item.price * item.quantity * (1 - descuento / 100))}</Typography>
            </Box>
          ))}
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Total</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>{formatCurrency(calculateTotalPrice())}</Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          sx={{ backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.custom.hoover }, color: theme.palette.custom.light, borderRadius: '16px', mt: 2 }}
          onClick={handleSubmit}
          disabled={isLoading || !name || !email || !phone || !comercialID}
        >
          Confirmar Pedido
        </Button>
        <Button
          variant="outlined"
          sx={{ borderColor: theme.palette.primary.main, color: theme.palette.primary.main, '&:hover': { borderColor: theme.palette.custom.hoover, color: theme.palette.custom.hoover }, borderRadius: '16px', mt: 1 }}
          onClick={handleContinueShopping}
        >
          Sigue Comprando
        </Button>
      </Box>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Paper>
  );
};

export default CheckoutPage;



