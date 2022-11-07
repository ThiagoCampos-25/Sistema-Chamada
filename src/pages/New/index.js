/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useContext } from 'react';
import firebase from '../../services/firebaseConnection';
import { useHistory, useParams } from 'react-router-dom';

import Header from '../../components/Header';
import Title from '../../components/Title';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/auth';

import './new.css';
import { FiPlusCircle } from 'react-icons/fi';

export default function New() {

    const { id } = useParams();
    const history = useHistory();

    const [loadCustomers, setLoadCustomers] = useState(true);
    const [customers, setCustomers] = useState([]);
    const [customersSelected, setCustomersSelected] = useState(0);

    const [assunto, setAssunto] = useState('Suporte');
    const [status, setstatus] = useState('Aberto');
    const [complemento, setComplemento] = useState('');

    const [idCustomer, setIdCustomer] = useState(false);

    const { user } = useContext(AuthContext);

    useEffect(() => {
        async function loadCustomers() {
            await firebase.firestore().collection('customers')
                .get()
                .then((snapshot) => {
                    let lista = [];

                    snapshot.forEach((doc) => {
                        lista.push({
                            id: doc.id,
                            nomeFantasia: doc.data().nomeFantasia
                        })
                    })
                    if (lista.length === 0) {
                        console.log('Nenhuma empresa encontrada');
                        setCustomers([{ id: '1', nomeFantasia: 'Freela' }]);
                        setLoadCustomers(false);
                        return;
                    }
                    setCustomers(lista);
                    setLoadCustomers(false);

                    if (id) {
                        loadId(lista);
                    }
                })
                .catch((error) => {
                    console.log('Deu algum erro!', error);
                    setLoadCustomers(false);
                    setCustomers([{ id: '1', nomeFantasia: '' }]);
                })
        }

        loadCustomers();

    }, [id]);

    async function loadId(lista) {
        await firebase.firestore().collection('chamados').doc(id)
            .get()
            .then((snapshot) => {
                setAssunto(snapshot.data().assunto);
                setstatus(snapshot.data().status);
                setComplemento(snapshot.data().complemento)

                let index = lista.findIndex(item => item.id === snapshot.data().clienteId);
                setCustomersSelected(index);
                setIdCustomer(true);
            })
            .catch((err) => {
                console.log('Erro no ID passado: ', err)
                setIdCustomer(false);
            })
    }

    async function handleRegister(e) {
        e.preventDefault();

        if (idCustomer) {
            await firebase.firestore().collection('chamados')
                .doc(id)
                .update({
                    cliente: customers[customersSelected].nomeFantasia,
                    clienteId: customers[customersSelected].id,
                    assunto: assunto,
                    status: status,
                    complemento: complemento,
                    userId: user.uid
                })
                .then(()=>{
                    toast.success('Chamado Editado com sucesso!');
                    setCustomersSelected(0);
                    setComplemento('');
                    history.push('/dashboard');
                })
                .catch((err)=>{
                    toast.error('OPs erro ao registrar, tente mais tarde.')
                    console.log(err);
                })
                return;
        }
        await firebase.firestore().collection('chamados')
            .add({
                created: new Date(),
                cliente: customers[customersSelected].nomeFantasia,
                clienteId: customers[customersSelected].id,
                assunto: assunto,
                status: status,
                complemento: complemento,
                userId: user.uid
            })
            .then(() => {
                toast.success('Chamado criado com sucesso!');
                setComplemento('');
                setCustomersSelected(0);
            })
            .catch((err) => {
                toast.error('Ops, erro ao registrar, tente mais tarde.')
                console.log(err)
            })

    }

    //chamado quando troca o assunto
    function handleChangeSelect(e) {
        setAssunto(e.target.value);
    }

    //chamado quando troca o status
    function handleOptionChange(e) {
        setstatus(e.target.value);
    }

    //chamado quando troca de cliente
    function handleChangeCustomers(e) {
        setCustomersSelected(e.target.value);
    }

    return (
        <div>
            <Header />

            <div className='content'>
                <Title name="Novo chamado">
                    <FiPlusCircle size={25} />
                </Title>

                <div className='container'>

                    <form className='form-profile' onSubmit={handleRegister}>

                        <label>Cliente:</label>
                        {loadCustomers ? (
                            <input type="text" disabled={true} value="Carregando clientes..." />
                        ) : (
                            <select value={customersSelected} onChange={handleChangeCustomers}>
                                {customers.map((item, index) => {
                                    return (
                                        <option key={item.id} value={index}>
                                            {item.nomeFantasia}
                                        </option>
                                    )
                                })}
                            </select>
                        )}


                        <label>Assunto</label>
                        <select value={assunto} onChange={handleChangeSelect}>
                            <option value="Suporte">Suporte</option>
                            <option value="Visita Tecnica">Visita Tecnica</option>
                            <option value="Financeiro">Financeiro</option>
                        </select>

                        <label>Status</label>
                        <div className='status'>
                            <input
                                type="radio"
                                nome="radio"
                                value="Aberto"
                                onChange={handleOptionChange}
                                checked={status === 'Aberto'}
                            />
                            <span>Em Aberto</span>

                            <input
                                type="radio"
                                nome="radio"
                                value="Progresso"
                                onChange={handleOptionChange}
                                checked={status === 'Progresso'}
                            />
                            <span>Progresso</span>

                            <input
                                type="radio"
                                nome="radio"
                                value="Atendido"
                                onChange={handleOptionChange}
                                checked={status === 'Atendido'}
                            />
                            <span>Atendido</span>
                        </div>

                        <label>Complemento</label>
                        <textarea
                            type="text"
                            placeholder="Descreva seu problema (opcional)."
                            value={complemento}
                            onChange={(e) => setComplemento(e.target.value)}
                        />

                        <button type='submit'>Registrar</button>
                    </form>
                </div>
            </div>
        </div>
    );
}