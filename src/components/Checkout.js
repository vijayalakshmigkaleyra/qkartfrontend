import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

 const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
}) => {
  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete address"
        onChange={(e) => {
          handleNewAddress({ ...newAddress, value: e.target.value });
        }}
      />
      <Stack direction="row" my="1rem">
        <Button
          variant="contained"
          onClick={async () => {
            await addAddress(token, newAddress);
          }}
        >
          Add
        </Button>
        <Button
          variant="text"
          onClick={() => {
            handleNewAddress({ isAddingNewAddress: false, value: "" });
          }}
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {
 const token=localStorage.getItem("token");
 const history=useHistory();
 const {enqueueSnackbar}=useSnackbar();
 const [items,setItems]=useState([]);
 const [products,setProducts]=useState([]);
 const [addresses,setAddresses]=useState({all: [],selected: ""});
 const [newAddress,setNewAddress]=useState({
  isAddingNewAddress:false,
  value:"",
 });
  
const getProducts=async()=>{
  try{
    const response=await axios.get(`${config.endpoint}/products`);
    setProducts(response.data);
    return response.data;
  }catch(e){
    if(e.response && e.response.status===500){
      enqueueSnackbar(e.response.data.message,{variant:"error"});
      return null;
    }else{
      enqueueSnackbar(
        "Could not fetch poducts. Check that the backend is running,reachable and returns valid JSON.",
        {
          variant:"error",
        }
      );
    }
  }
};

const fetchCart=async(token)=>{
  if(!token)return;
  try{
    const response=await axios.get(`${config.endpoint}/cart`,{
      headers:{
        Authorization:`Bearer ${token}`,
      },
    });
    return response.data;
  }catch{
    enqueueSnackbar(
      "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
      {
        variant:"error",
      }
    );
    return null;
  }
};
 

const getAddresses=async (token)=>{
  if(!token){
    history.push("/");
  }
  try{
    const response=await axios.get(`${config.endpoint}/user/addresses`,{
      headers:{
        Authorization:`Bearer ${token}`,
      },
    });
    setAddresses({...addresses,all:response.data});
  }catch{
    if(!token){
      enqueueSnackbar("You must be logged in to access checkout page",{
        variant:"info",
      });
    }else{
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant:"error",
        }
      );
    }
  }
};

const addAddress = async (token, newAddress) => {
  try {
    const response = await axios.post(
      `${config.endpoint}/user/addresses`,
      {
        address: newAddress.value,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setAddresses({ ...addresses, all: response.data });
    setNewAddress((currAddress) => ({
      ...currAddress,
      isAddingNewAddress: false,
      value: "",
    }));
    enqueueSnackbar("New Address added Successfully", {
      variant: "success",
    });
  } catch (e) {
    if (e.response) {
      enqueueSnackbar(e.response.data.message, { variant: "error" });
    } else {
      enqueueSnackbar(
        "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
    }
  }
};


const deleteAddress = async (token, addressId) => {
  try {
    let response = await axios.delete(
      `${config.endpoint}/user/addresses/${addressId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setAddresses({ ...addresses, all: response.data });
    enqueueSnackbar("Deleted", { variant: "success" });
  } catch (e) {
    if (e.response) {
      enqueueSnackbar(e.response.data.message, { variant: "error" });
    } else {
      enqueueSnackbar(
        "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
    }
  }
};

const validateRequest = (items, addresses) => {
  if (getTotalCartValue(items) > localStorage.getItem("balance")) {
    enqueueSnackbar(
      "You do not have enough balance in your wallet for this purchase",
      { variant: "warning" }
    );
    return false;
  }
  if (addresses.all.length === 0) {
    enqueueSnackbar("Please add a new address before proceeding.", {
      variant: "warning",
    });
    return false;
  }
  if (!addresses.selected && addresses.all.length > 0) {
    enqueueSnackbar("Please select one shipping address to proceed.", {
      variant: "warning",
    });
    return false;
  }

  return true;
};

const performCheckout = async (token, items, addresses) => {
  let flag = validateRequest(items, addresses);
  if (flag) {
    try {
      let response = await axios.post(
        `${config.endpoint}/cart/checkout`,
        { addressId: addresses.selected },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
     
      if (response.data.success) {
      
        let balance =
          localStorage.getItem("balance") - getTotalCartValue(items);
        localStorage.setItem("balance", balance);
       
        history.push("/thanks");
      
        enqueueSnackbar("Order placed successfully", {
          variant: "success",
        });
        return true;
      }
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not place order. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  } else {
    return false;
  }
};


useEffect(() => {
  const onLoadHandler = async () => {
    const productsData = await getProducts();

    const cartData = await fetchCart(token);

    if (productsData && cartData) {
      const cartDetails = await generateCartItemsFrom(cartData, productsData);
      setItems(cartDetails);
    }

    await getAddresses(token);
  };
  onLoadHandler();
}, []);


return (
  <>
    <Header />
    <Grid container>
      <Grid item xs={12} md={9}>
        <Box className="shipping-container" minHeight="100vh">
          <Typography color="#3C3C3C" variant="h4" my="1rem">
            Shipping
          </Typography>
          <Typography color="#3C3C3C" my="1rem">
            Manage all the shipping addresses you want. This way you won't
            have to enter the shipping address manually with every order.
            Select the address you want to get your order delivered.
          </Typography>
          <Divider />
          {addresses.all.length === 0 && (
            <Typography my="1rem">
              No addresses found for this account. Please add one to proceed
            </Typography>
          )}
          {addresses.all.length > 0 &&
            addresses.all.map((address) => (
              <Box
                className={
                  addresses.selected === address._id
                    ? "address-item selected"
                    : "address-item not-selected"
                }
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={3}
                key={address._id}
              >
                <Box ml={1} width="100%">
                  <Button
                  className="btn"
                    type="text"
                    role="text"
                    variant="text"
                    sx={{ color: "black"}}
                    onClick={() => {
                      setAddresses({ ...addresses, selected: address._id });
                    }}
                  >
                    {address.address}
                  </Button>
                </Box>
                <Box mr={1}>
                  <Button 
                  className="btn"
                    onClick={() => {
                      deleteAddress(token, address._id);
                    }}
                  >
                    <Delete /> Delete
                  </Button>
                </Box>
              </Box>
            ))}

         
          {!newAddress.isAddingNewAddress && (
            <Button
              color="primary"
              variant="contained"
              id="add-new-btn"
              size="large"
              onClick={() => {
                setNewAddress({ ...newAddress, isAddingNewAddress: true });
              }}
            >
              Add new address
            </Button>
          )}
          {newAddress.isAddingNewAddress && (
            <AddNewAddressView
              token={token}
              newAddress={newAddress}
              handleNewAddress={setNewAddress}
              addAddress={addAddress}
            />
          )}

          <Typography color="#3C3C3C" variant="h4" my="1rem">
            Payment
          </Typography>
          <Typography color="#3C3C3C" my="1rem">
            Payment Method
          </Typography>
          <Divider />

          <Box my="1rem">
            <Typography>Wallet</Typography>
            <Typography>
              Pay ${getTotalCartValue(items)} of available $
              {localStorage.getItem("balance")}
            </Typography>
          </Box>

          <Button
            startIcon={<CreditCard />}
            variant="contained"
            className="btn"
            onClick={() => performCheckout(token, items, addresses)}
          >
            PLACE ORDER
          </Button>
        </Box>
      </Grid>
      <Grid item xs={12} md={3} bgcolor="#E9F5E1">
        <Cart isReadOnly={true} products={products} items={items} />
      </Grid>
    </Grid>
    <Footer />
  </>
);

};
export default Checkout;
