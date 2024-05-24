import React, { useState, useEffect, useCallback } from "react";
import L from "leaflet";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "../App.css";
import "leaflet/dist/leaflet.css";
import { Tooltip } from "react-leaflet/Tooltip";
import { Popup } from "react-leaflet/Popup";

const icon = L.icon({
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
	iconSize: [25, 41],
	iconAnchor: [32, 61],
});

const predefinedLocation = {
	latitude: 6.465422,
	longitude: 3.406448,
};

const Map = () => {
	const [markers, setMarkers] = useState([]);
	const [customers, setCustomers] = useState([]);
	const [distances, setDistances] = useState({});
	const [formData, setFormData] = useState({
		name: "",
		address: "",
		contactInfo: "",
	});
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [newCustomerLatLng, setNewCustomerLatLng] = useState(null);
	const [userLocation, setUserLocation] = useState({
		latitude: predefinedLocation.latitude,
		longitude: predefinedLocation.longitude,
	});

	const calculateDistance = useCallback((origin, destination, customerId) => {
		if (!destination) return;

		const toRadians = (degree) => degree * (Math.PI / 180);

		const R = 6371; // Radius of the Earth in kilometers

		const dLat = toRadians(destination.lat - origin.latitude);
		const dLng = toRadians(destination.lng - origin.longitude);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(toRadians(origin.latitude)) *
				Math.cos(toRadians(destination.lat)) *
				Math.sin(dLng / 2) *
				Math.sin(dLng / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const distanceKm = R * c; // Distance in kilometers

		const distance =
			distanceKm < 1
				? (distanceKm * 1000).toFixed(2) + " m"
				: distanceKm.toFixed(2) + " km";

		setDistances((prevDistances) => ({
			...prevDistances,
			[customerId]: distance,
		}));
	}, []);

	const calculateDistances = useCallback(
		(customers) => {
			customers.forEach((customer) => {
				calculateDistance(userLocation, customer.location, customer._id);
			});
		},
		[calculateDistance, userLocation]
	);

	useEffect(() => {
		axios.get("http://localhost:5000/customers").then((response) => {
			const customers = response.data;
			if (customers.length > 0) {
				setCustomers(customers);
				const markers = customers.map((customer) => ({
					lat: customer.location?.lat,
					lng: customer.location?.lng,
				}));
				setMarkers(markers);
				calculateDistances(customers);
			}
		});

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setUserLocation({
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
					});
				},
				(error) => {
					console.error("Error fetching user location:", error);
					// Fall back to predefined location if error occurs
					setUserLocation(predefinedLocation);
				}
			);
		} else {
			// Fall back to predefined location if geolocation is not supported
			setUserLocation(predefinedLocation);
		}
	}, [calculateDistances]);

	const AddMarker = () => {
		useMapEvents({
			click(e) {
				const { lat, lng } = e.latlng;
				setNewCustomerLatLng({ lat, lng });
				setIsModalOpen(true);
			},
		});

		return null;
	};

	const addCustomer = useCallback(() => {
		if (!newCustomerLatLng) return;

		const name = formData.name;
		const address = formData.address;
		const contactInfo = formData.contactInfo;
		const { lat, lng } = newCustomerLatLng;

		const customer = { name, address, contactInfo, location: { lat, lng } };

		axios.post("http://localhost:5000/customers", customer).then((response) => {
			const newCustomer = response.data;
			setCustomers((prevCustomers) => [...prevCustomers, newCustomer]);
			setMarkers((prevMarkers) => [...prevMarkers, { lat, lng }]);
			calculateDistance(userLocation, { lat, lng }, newCustomer._id);
		});

		setIsModalOpen(false);
		setFormData({});
	}, [formData, newCustomerLatLng, calculateDistance, userLocation]);

	const handleFormData = (e) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	return (
		<>
			<div className="map_wrapper">
				{isModalOpen && (
					<div
						className="form_wrapper"
						onClick={(e) => {
							e.stopPropagation();
							setFormData({});
							setIsModalOpen(false);
						}}
					>
						<form
							onSubmit={(e) => {
								e.preventDefault();

								addCustomer();
							}}
							onClick={(e) => {
								e.stopPropagation();
							}}
						>
							<h2>Add Customer Info</h2>
							<label htmlFor="name">Name</label>
							<input
								type="text"
								name="name"
								value={formData.name}
								onChange={handleFormData}
								onClick={(e) => {
									e.stopPropagation();
								}}
								required
							/>

							<label htmlFor="address">Address</label>
							<input
								type="text"
								name="address"
								value={formData.address}
								onChange={handleFormData}
								onClick={(e) => {
									e.stopPropagation();
								}}
								required
							/>

							<label htmlFor="contactInfo">Contact Info</label>
							<input
								type="text"
								name="contactInfo"
								value={formData.contactInfo}
								onChange={handleFormData}
								onClick={(e) => {
									e.stopPropagation();
								}}
								required
							/>

							<button
								type="submit"
								onClick={(e) => {
									e.stopPropagation();
								}}
							>
								Locate
							</button>
						</form>
					</div>
				)}
				<MapContainer
					center={[userLocation.latitude, userLocation.longitude]}
					zoom={13}
					style={{ height: "100%", width: "100%" }}
				>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
					<Marker
						position={[userLocation?.latitude, userLocation?.longitude]}
						icon={icon}
						style={{ width: "200px", height: "200px" }}
					>
						<Tooltip>You</Tooltip>
						<Popup>You are here</Popup>
					</Marker>

					{customers?.map((customer, index) => (
						<Marker
							key={customer._id}
							position={[customer.location?.lat, customer.location?.lng]}
							icon={icon}
							style={{ width: "200px", height: "200px" }}
						>
							<Tooltip>{customer.name}</Tooltip>
							<Popup>{`${customer.name} is ${
								distances[customer._id]
							} away from you`}</Popup>
						</Marker>
					))}
					<AddMarker />
				</MapContainer>

				{/* <div className="customer_distance_cont">
					<h2>Customer Distances</h2>
					<ol>
						{customers.map((customer) => (
							<li key={customer._id}>
								{customer.name}: {distances[customer._id]}
							</li>
						))}
					</ol>
				</div> */}
			</div>
		</>
	);
};

export default Map;
