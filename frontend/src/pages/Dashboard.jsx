import React, { useEffect, useState } from 'react';
import {
  getShops,
  getProducts,
  getEvents,
  getOffers,
  getParkingSlots,
} from '../services/postgrest';
import StatCard from '../components/StatCard';
import { IconStore, IconTag, IconCalendar, IconCar, IconAlertCircle } from '../components/Icons';

const Dashboard = () => {
  const [data, setData] = useState({
    shops: [],
    products: [],
    events: [],
    offers: [],
    parking: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [shops, products, events, offers, parking] = await Promise.all([
        getShops(),
        getProducts(),
        getEvents(),
        getOffers(),
        getParkingSlots(),
      ]);

      setData({ shops, products, events, offers, parking });
    } catch (err) {
      console.error('Dashboard API error:', err);
      setError('Unable to load dashboard data. Check that PostgREST is running on port 3000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableParking = data.parking.filter(
    (slot) => String(slot.status).toLowerCase() === 'available'
  ).length;

  const activeOffers = data.offers.filter((offer) => {
    const today = new Date().toISOString().slice(0, 10);
    return offer.start_date <= today && offer.end_date >= today;
  }).length;

  const upcomingEvents = data.events.filter(
    (event) => event.event_date >= new Date().toISOString().slice(0, 10)
  ).length;

  if (loading) {
    return <div className="card" style={{ padding: 32 }}>Loading live mall data from PostgreSQL...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Mall Operations Executive Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4 }}>
            Phoenix Marketcity, Kurla, Mumbai · Live PostgreSQL data
          </p>
        </div>
        <button onClick={loadData} className="btn btn-secondary btn-sm">
          Refresh Data
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: 16, borderRadius: 8 }}>
          <p>{error}</p>
          <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}>
            Retry
          </button>
        </div>
      )}

      <div className="grid-cols-4">
        <StatCard title="Total Shops" value={data.shops.length} icon={IconStore} color="blue" subtitle="Registered mall shops" />
        <StatCard title="Total Products" value={data.products.length} icon={IconTag} color="purple" subtitle="Products listed in API" />
        <StatCard title="Upcoming Events" value={upcomingEvents} icon={IconCalendar} color="amber" subtitle="Based on event dates" />
        <StatCard title="Available Parking" value={availableParking} icon={IconCar} color="emerald" subtitle="Slots marked available" />
        <StatCard title="Active Offers" value={activeOffers} icon={IconAlertCircle} color="indigo" subtitle="Within offer date range" />
      </div>

      <div className="grid-cols-2">
        <section className="card">
          <div className="card-header">
            <h3 className="card-title">Shops Directory</h3>
          </div>
          {data.shops.length === 0 ? <p>No shop records found.</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>Shop</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Category</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Floor</th>
                  </tr>
                </thead>
                <tbody>
                  {data.shops.slice(0, 8).map((shop) => (
                    <tr key={shop.shop_id}>
                      <td style={{ padding: 8 }}>{shop.shop_name}</td>
                      <td style={{ padding: 8 }}>{shop.category}</td>
                      <td style={{ padding: 8 }}>{shop.floor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h3 className="card-title">Products & Stock</h3>
          </div>
          {data.products.length === 0 ? <p>No product records found.</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>Product</th>
                    <th style={{ textAlign: 'right', padding: 8 }}>Price</th>
                    <th style={{ textAlign: 'right', padding: 8 }}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products.slice(0, 8).map((product) => (
                    <tr key={product.product_id}>
                      <td style={{ padding: 8 }}>{product.product_name}</td>
                      <td style={{ padding: 8, textAlign: 'right' }}>₹{Number(product.price).toLocaleString('en-IN')}</td>
                      <td style={{ padding: 8, textAlign: 'right' }}>{product.stock_quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <div className="grid-cols-2">
        <section className="card">
          <div className="card-header"><h3 className="card-title">Events</h3></div>
          {data.events.length === 0 ? <p>No events found.</p> : data.events.slice(0, 5).map((event) => (
            <div key={event.event_id} style={{ padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
              <strong>{event.event_name}</strong>
              <div style={{ color: '#64748b', fontSize: 13 }}>{event.event_date} · {event.location}</div>
            </div>
          ))}
        </section>

        <section className="card">
          <div className="card-header"><h3 className="card-title">Current Offers</h3></div>
          {data.offers.length === 0 ? <p>No offers found.</p> : data.offers.slice(0, 5).map((offer) => (
            <div key={offer.offer_id} style={{ padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
              <strong>{offer.offer_name}</strong>
              <div style={{ color: '#64748b', fontSize: 13 }}>
                {offer.discount_percentage}% discount · {offer.start_date} to {offer.end_date}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;