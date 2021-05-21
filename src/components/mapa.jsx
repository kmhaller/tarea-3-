import React, {Component} from "react";
import './Mapa.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip} from 'react-leaflet';
import io from 'socket.io-client'
//import { w3cwebsocket as W3CWebsScket} from 'websocket';

class Mapa extends Component{
    constructor(props) {
        super(props);
        this.state = {socket: undefined, chat: [], posicion: [], vuelos: [], name: null, message: null}

        this.handleChange = this.handleChangenombre.bind(this);
        this.handleChange = this.handleChangemensaje.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    componentDidMount(){
        const socket = io(
            "wss://tarea-3-websocket.2021-1.tallerdeintegracion.cl", { path: '/flights' }
          );
        socket.emit("FLIGHTS")
        socket.on("POSITION", ({code, position}) => {this.setState({posicion: this.state.posicion.concat({code, position})})})
        socket.on("FLIGHTS",  (data) => {this.setState({vuelos: this.state.vuelos.concat(data)})})
        socket.on("CHAT", ({name, date, message}) => {console.log(name, date, message, document); setTimeout(() => {
            var elem = document.getElementById("chatt"); elem.scrollTo(0,elem.scrollHeight);},100); this.setState({chat: this.state.chat.concat({name, date, message})})})
        this.setState({socket})
    }
    componentDidUnMount(){
        this.state.socket.close();
    }

    handleChangenombre(event) {
        console.log(event.target.value);
        this.setState({name: event.target.value});

      }
    
    handleChangemensaje(event) {
        console.log(event.target.value);
        this.setState({message: event.target.value});
      }
    
    handleSubmit(event) {
        event.preventDefault()
        console.log({name: this.state.name, message: this.state.message})
        this.state.socket?.emit("CHAT", {name: this.state.name, message: this.state.message})
    }

    render () {
        const position = [-36.61667, -64.28333]
        const blueOptions = { color: 'blue' }
        const fillBlackOptions = { color: 'black' }
        const {posicion, vuelos, chat, name, message} = this.state
        //console.log(this.state.vuelos)   
        return  (
            <div>
                <div className="navv">
                    <h1>Tarea 3</h1>
                </div>
                <div className="container">
                    <div className="mapa">
                        <div className="leaflet-container">
                            <MapContainer center={position} zoom={6} scrollWheelZoom={false}>
                            <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {vuelos.map((data) => {
                                return(
                                    <Polyline pathOptions={blueOptions} positions={[data.origin,data.destination]}>
                                        <Popup>
                                            {data.code}
                                        </Popup>
                                        <Circle center={data.origin} pathOptions={fillBlackOptions} radius={1000} />
                                        <Circle center={data.destination} pathOptions={fillBlackOptions} radius={1000} />
                                    </Polyline>
                                )
                            })}
                            
                            {posicion.map((data) => {
                                return(
                                    <Marker position={data.position}>
                                        <Popup>
                                            {data.code}
                                        </Popup>
                                        <Tooltip>{data.code}</Tooltip>
                                    </Marker>
                                )
                            })}
                            </MapContainer>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="chatgen">
                        <h1>Chat</h1>
                            <div className="chatborder" id="chatt">
                                {chat.map((data) => {
                                    return(
                                        <div className="chat" >
                                            
                                            <p>nombre:  {data.name}  | fecha: {new Date(data.date).toString()} </p>
                                            <p>{data.message} </p>

                                        </div>
                                        )
                                    })}
                            </div>
                            <div className="container" className="inputt">
                                <form onSubmit= {(e, value) => {this.handleSubmit(e)}}>
                                        <label>
                                                <input type="text" className="nomb" placeholder="Nombre" name={this.state.name} value={this.state.name} onChange = {(e, value) => {this.handleChangenombre(e)}}/>
                                                <input type="text" className="mensaje" id="chatbox" placeholder="Hola! Escribe aquí para chatear." value={this.state.message} onChange={(e, value) =>{this.handleChangemensaje(e)}}></input>
                                        </label>
                                    <button type="submit" value="Enviar" className="boton" >Enviar</button>
                                </form>
                            </div>
                    </div>
                </div>
                <div className="container">
                <h1>Información de Vuelos </h1>
                    {vuelos.map((data) => {
                        return(
                            <div className="vuelos">
                                <div className="texto">
                                    <h3>Vuelo: {data.code} </h3>
                                    <h6>Aerolinea: {data.airline} </h6>
                                    <h6>Origen: {data.origin} </h6>
                                    <h6>Destino: {data.destination} </h6>
                                    <h6>Avion: {data.plane} </h6>
                                    <h6>Asientos: {data.seats} </h6>
                                    <p>Pasajeros: {data.passengers.map((pasajero) => {return(<p>{pasajero.name} , {pasajero.age} </p>)})} </p>
                                </div>
                            </div>
                            )
                        })}
                </div>
            </div>
        );
    }
}
export default Mapa;