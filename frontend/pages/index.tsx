import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import Cookies from 'js-cookie';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      access_token
      user { id name email role country }
    }
  }
`;

const ME = gql`
  query Me {
    me { id name email role country }
  }
`;

const RESTAURANTS = gql`
  query Restaurants($country: String!) {
    restaurants(country: $country) {
      id
      name
      country
      menus { id name price }
    }
  }
`;

const CREATE_ORDER = gql`
  mutation CreateOrder($restaurantId: Int!, $items: [OrderItemInput!]!) {
    createOrder(restaurantId: $restaurantId, items: $items) { id total status country }
  }
`;

const ORDERS = gql`
  query MyOrders { orders { id status total country } }
`;

const PAYMENT_METHODS = gql`
  query PaymentMethods { paymentMethods { id label details isDefault } }
`;

const CHECKOUT_ORDER = gql`
  mutation CheckoutOrder($orderId: Int!, $paymentMethodId: Int!) { checkoutOrder(orderId: $orderId, paymentMethodId: $paymentMethodId) { id status } }
`;

const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: Int!) { cancelOrder(orderId: $orderId) { id status } }
`;

const ADD_PAYMENT_METHOD = gql`
  mutation AddPaymentMethod($label:String!, $details:String!, $isDefault:Boolean) {
    addPaymentMethod(label:$label, details:$details, isDefault:$isDefault){id label details isDefault}
  }
`;

const SET_DEFAULT_PAYMENT_METHOD = gql`
  mutation SetDefaultPaymentMethod($paymentId: Int!) {
    setDefaultPaymentMethod(paymentId: $paymentId) { id isDefault }
  }
`;

export default function Home() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [chosenRestaurant, setChosenRestaurant] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<{ [key: number]: number }>({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);
  const [paymentLabel, setPaymentLabel] = useState('Card');
  const [paymentDetails, setPaymentDetails] = useState('**** **** **** 1234');

  const [apiError, setApiError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [paymentIsDefault, setPaymentIsDefault] = useState(false);
  const [login] = useMutation(LOGIN);
  const [createOrder] = useMutation(CREATE_ORDER, { refetchQueries: ['MyOrders'] });
  const [checkoutOrder] = useMutation(CHECKOUT_ORDER, { refetchQueries: ['MyOrders'] });
  const [cancelOrder] = useMutation(CANCEL_ORDER, { refetchQueries: ['MyOrders'] });
  const [addPaymentMethod] = useMutation(ADD_PAYMENT_METHOD, { refetchQueries: ['PaymentMethods'] });
  const [setDefaultPaymentMethod] = useMutation(SET_DEFAULT_PAYMENT_METHOD, { refetchQueries: ['PaymentMethods'] });

  const { data: meData, refetch: refetchMe } = useQuery(ME, {
    fetchPolicy: 'network-only',
    skip: !Cookies.get('token'),
  });

  const { data: restaurantsData } = useQuery(RESTAURANTS, {
    variables: { country: user?.country ?? 'INDIA' },
    skip: !user,
  });

  const { data: ordersData } = useQuery(ORDERS, {
    fetchPolicy: 'network-only',
    skip: !user,
  });

  const { data: paymentMethodsData } = useQuery(PAYMENT_METHODS, { skip: !user });

  const defaultPaymentMethod = (paymentMethodsData as any)?.paymentMethods?.find((pm: any) => pm.isDefault);

  useEffect(() => {
    document.title = 'Food Ordering App';
  }, []);

  useEffect(() => {
    if ((meData as any)?.me) {
      setUser((meData as any).me);
    }
  }, [meData]);

  useEffect(() => {
    if (user?.role === 'MANAGER') {
      setSelectedPaymentMethod(defaultPaymentMethod?.id ?? null);
      return;
    }

    if (!selectedPaymentMethod && (paymentMethodsData as any)?.paymentMethods?.length > 0) {
      setSelectedPaymentMethod((paymentMethodsData as any).paymentMethods[0].id);
    }
  }, [paymentMethodsData, selectedPaymentMethod, user?.role, defaultPaymentMethod?.id]);

  const handleLogin = async () => {
    try {
      setLoginError(null);
      const res = await login({ variables: { email, password } });
      const token = (res.data as any).login.access_token;
      const userData = (res.data as any).login.user;
      Cookies.set('token', token);
      setUser(userData);
    } catch (error: any) {
      setLoginError(error.message ?? 'Login failed');
    }
  };

  const handleCreateOrder = async () => {
    if (!user || !(restaurantsData as any)?.restaurants?.length || !chosenRestaurant) return;
    const items = Object.entries(selectedItems).map(([menuItemId, qty]) => ({
      menuItemId: Number(menuItemId),
      qty,
    }));
    if (items.length === 0) return;

    try {
      setApiError(null);
      await createOrder({ variables: { restaurantId: chosenRestaurant, items } });
      setSelectedItems({}); // Reset after creating order
    } catch (error: any) {
      setApiError(error.message ?? 'Could not create order');
    }
  };

  const handleCheckout = async (orderId: number) => {
    const methodId = user?.role === 'MANAGER' ? defaultPaymentMethod?.id : selectedPaymentMethod;
    if (!methodId) {
      setApiError('Please select a payment method or ask admin to set a default payment method');
      return;
    }
    try {
      setApiError(null);
      await checkoutOrder({ variables: { orderId, paymentMethodId: methodId } });
    } catch (error: any) {
      setApiError(error.message ?? 'Could not checkout order');
    }
  };

  const handleCancel = async (orderId: number) => {
    try {
      setApiError(null);
      await cancelOrder({ variables: { orderId } });
    } catch (error: any) {
      setApiError(error.message ?? 'Could not cancel order');
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    setUser(null);
  };

  const canCheckoutCancel = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canViewPaymentMethods = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canManagePaymentMethods = user?.role === 'ADMIN';

  return (
    <div className={user ? 'min-h-screen p-6' : 'min-h-screen flex items-center justify-center p-6'}>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-3xl font-bold mb-6 text-center">Food Ordering App 🍱</h1>
        {!user ? (
          <div>
            <h2 className="text-2xl mb-4">Welcome, please login to continue ordering foods</h2>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border p-2 my-1 w-full" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="border p-2 my-1 w-full" />
            <button onClick={handleLogin} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded transition-colors hover:bg-blue-700">Login</button>
            {loginError && <div className="mt-2 p-2 bg-red-100 text-red-800 rounded">{loginError}</div>}
          </div>
        ) : (
          <div>
            <div className="flex justify-between mb-4">
              <div>
                <h1 className="text-2xl">Hello, {user.name}</h1>
                <div>Role: {user.role} / Country: {user.country}</div>
              </div>
              <button onClick={handleLogout} className="bg-red-500 text-white px-2 py-1 rounded transition-colors hover:bg-red-600">Logout</button>
            </div>

            <section className="mb-4">
              <h2 className="text-xl">Restaurants</h2>
              <select value={chosenRestaurant ?? ''} onChange={(e) => { setChosenRestaurant(Number(e.target.value)); setSelectedItems({}); }} className="border p-2">
                <option value="" disabled>Select restaurant</option>
                {(restaurantsData as any)?.restaurants?.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <button onClick={handleCreateOrder} disabled={Object.keys(selectedItems).length === 0} className="ml-2 px-3 py-1 bg-green-500 text-white rounded transition-colors hover:bg-green-600 disabled:bg-gray-400 disabled:hover:bg-gray-400">Create Order</button>
              {chosenRestaurant && (
                <div className="mt-4">
                  <h3 className="text-lg">Menu Items</h3>
                  {(restaurantsData as any)?.restaurants?.find((r: any) => r.id === chosenRestaurant)?.menus?.map((menu: any) => (
                    <div key={menu.id} className="flex items-center gap-2 my-2">
                      <input
                        type="checkbox"
                        checked={!!selectedItems[menu.id]}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems({ ...selectedItems, [menu.id]: 1 });
                          } else {
                            const newItems = { ...selectedItems };
                            delete newItems[menu.id];
                            setSelectedItems(newItems);
                          }
                        }}
                      />
                      <span>{menu.name} - ${menu.price}</span>
                      {selectedItems[menu.id] && (
                        <input
                          type="number"
                          min="1"
                          value={selectedItems[menu.id]}
                          onChange={(e) => setSelectedItems({ ...selectedItems, [menu.id]: Number(e.target.value) })}
                          className="border p-1 w-16"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mb-4">
              <h2 className="text-xl">Payment Methods</h2>
              {!canViewPaymentMethods ? (
                <div className="text-gray-600">Payment method management is unavailable for your role.</div>
              ) : (paymentMethodsData as any)?.paymentMethods?.length === 0 ? (
                <div className="text-gray-600">No payment methods available, please add one.</div>
              ) : (
                <div className="space-y-2">
                  {(paymentMethodsData as any)?.paymentMethods?.map((pm: any) => (
                    <div key={pm.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={selectedPaymentMethod === pm.id}
                        onChange={() => setSelectedPaymentMethod(pm.id)}
                        disabled={user?.role === 'MANAGER'}
                      />
                      <span>{pm.label} - {pm.details}</span>
                      {pm.isDefault && <span className="ml-2 px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">Default</span>}
                      {canManagePaymentMethods && !pm.isDefault && (
                        <button
                          onClick={() => setDefaultPaymentMethod({ variables: { paymentId: pm.id } })}
                          className="ml-2 px-2 py-1 bg-blue-600 text-white rounded text-sm transition-colors hover:bg-blue-700"
                        >
                          Set default
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mb-4">
              <h2 className="text-xl">Orders</h2>
              {(ordersData as any)?.orders?.length === 0 && <div className="text-gray-600">No orders placed yet</div>}
              <ul>
                {(ordersData as any)?.orders?.map((o: any) => (
                  <li key={o.id} className="flex flex-wrap items-center gap-2 py-1">
                    <span>#{o.id} {o.status} ${o.total} {o.country}</span>
                    {o.status === 'PENDING' && canCheckoutCancel && (
                      <>
                        <button
                          onClick={() => handleCheckout(o.id)}
                          disabled={!selectedPaymentMethod}
                          className="bg-blue-600 px-2 py-1 text-white rounded transition-colors hover:bg-blue-700 disabled:bg-gray-400 disabled:hover:bg-gray-400"
                        >
                          Checkout
                        </button>
                        <button onClick={() => handleCancel(o.id)} className="bg-orange-600 px-2 py-1 text-white rounded transition-colors hover:bg-orange-700">Cancel</button>
                      </>
                    )}
                    {o.status === 'PENDING' && !canCheckoutCancel && (
                      <span className="text-sm text-gray-500">No checkout/cancel permission for your role.</span>
                    )}
                    {o.status !== 'PENDING' && <span className="text-sm text-gray-600">(final)</span>}
                  </li>
                ))}
              </ul>
            </section>

            {apiError && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{apiError}</div>}
            {canManagePaymentMethods ? (
              <section>
                <h2 className="text-xl">Add Payment Method</h2>
                <input value={paymentLabel} onChange={(e) => setPaymentLabel(e.target.value)} placeholder="Label" className="border p-2 mr-2" />
                <input value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)} placeholder="Details" className="border p-2 mr-2" />
                <label className="inline-flex items-center mr-4">
                  <input type="checkbox" checked={paymentIsDefault} onChange={(e) => setPaymentIsDefault(e.target.checked)} className="mr-2" />
                  Set as default
                </label>
                <button onClick={() => { addPaymentMethod({ variables: { label: paymentLabel, details: paymentDetails, isDefault: paymentIsDefault } }); setPaymentLabel('Card'); setPaymentDetails(''); setPaymentIsDefault(false); }} className="bg-indigo-600 text-white p-2 rounded transition-colors hover:bg-indigo-700">Add Payment</button>
              </section>
            ) : (
              <section>
                <h2 className="text-xl">Add Payment Method</h2>
                <p className="text-gray-600">Only Admin can add/update payment methods.</p>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
