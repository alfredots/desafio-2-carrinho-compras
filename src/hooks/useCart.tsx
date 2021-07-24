import { AxiosResponse } from 'axios';
import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const sortFunction = (a: Product,b: Product) => {
    return a.id > b.id ? 1 : -1  
  }
  const [cart, setCart] = useState<Product[]>(() => {
    // const storagedCart = Buscar dados do localStorage

    // if (storagedCart) {
    //   return JSON.parse(storagedCart);
    // }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const filteredProducts = cart.filter(product => product.id === productId)
      if (filteredProducts.length === 0) {
        const response = await api.get<Product>(`/products/${productId}`)
        response.data.amount = 1
        setCart([...cart, response.data].sort(sortFunction))
      } else {
        const tempCart = cart.map((product) => {
          if (product.id === productId) {
            product.amount++
          }
          return product
        })
        setCart(tempCart.sort(sortFunction))
      }
      
    } catch {
      // TODO
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const tempCart = cart.filter(product => productId !== product.id)
      setCart(tempCart)
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      const response = await api.patch<Product>(`/products/${productId}`, {
        amount
      })
      const tempCart = cart.filter(product => productId !== product.id)
      const sortedCart = [...tempCart, response.data].sort(sortFunction)

      setCart(sortedCart)
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
