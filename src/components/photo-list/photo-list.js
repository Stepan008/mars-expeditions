import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import ArrowUpwardTwoToneIcon from '@material-ui/icons/ArrowUpwardTwoTone';

import ModalImage from 'react-modal-image';

import ScrollToTop from 'react-scroll-up';

import ErrorIndicator from '../error-indicator';
import NasaService from '../../services';

import './photo-list.scss';

const PhotoList = () => {
    const nasaService = new NasaService();

    const[manifest, setManifest] = useState("")
    const[rover, setRover] = useState("");
    const[camera, setCamera] = useState("");
    const[sol, setSol] = useState("");
    const[page, setPage] = useState(1);
    const[photos, setPhotos] = useState([]);
    const[error, setError] = useState(false);
    const[loading, setLoading] = useState(false);

    useEffect(() => {
        if(rover) {
            getManifest();
        }
        const elem = document.getElementById("sol-input");
        elem.value=""
        setSol("");
        setCamera("");
        setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rover]);

    const getManifest = async () => {
        await nasaService.getResource(rover)
            .then(data => {
                setManifest(data.photo_manifest);
            })
            .catch(onError)
    }

    const getNewSol = (e) => {
        const newSol = manifest.photos.find(ele => ele.sol == e.target.value);
        if(newSol) {
            setSol(newSol);
        }
    };

    const onRoverChange = (e) => {
        setRover(e.target.value);
    };

    const onCameraChange = (e) => {
        setCamera(e.target.value);
        setPage(1);
    };

    const onSolChange = () => {
        setCamera("")
    };

    const onError = (err) => {
        setError(true);
        setLoading(false)
    };

    const onFormSubmit = (e) => {
        setLoading(true);
        e.preventDefault();
        nasaService.getPhotos(rover, sol.sol, page, camera)
            .then(data => {
                const newPhotos = data.photos.map(photo => photo.img_src);
                setPhotos(newPhotos);
                setLoading(false)
            })
            .catch(onError)
    };

    const onLoadMoreClick = () => {
        nasaService.getPhotos(rover, sol.sol, page + 1, camera)
            .then(data => {
                if (data.photos.length){
                    const newPhotos = data.photos.map(photo => photo.img_src);
                    setPhotos([
                        ...photos,
                        ...newPhotos
                    ]);
                    setPage(page + 1);
                } else {
                    setPage(0);
                }
            })
            .catch(onError)
    };

    const renderPhotos = () => {
        if (loading){
            return <CircularProgress />
        } else {
            return (
                <React.Fragment>
                    <div className="photos-grid">
                        {
                            photos.map(photo => {
                                return (
                                    <div className="image-container" key={uuidv4()}>
                                        <ModalImage hideDownload hideZoom small={photo} large={photo} alt={photo}/>
                                    </div>
                                    
                                )
                            })
                        }
                    </div>
                    <div>
                        {
                            page === 0 || photos.length % 25 || photos.length === 0 ? null : <Button className="btn-load-more btn" variant="outlined" onClick={onLoadMoreClick}>Load more</Button>
                        }
                    </div>
                </React.Fragment>
            )
        }
    }

    return(
        <div className="photo-list">
            <form onSubmit={onFormSubmit}>
                <div className="input-section">
                    <FormControl variant="outlined" required className="select-form">
                        <InputLabel id="rover-select-label">Rover</InputLabel>
                        <Select
                            labelId="rover-select-label"
                            id="rover-select"
                            value={rover}
                            onChange={onRoverChange}
                            label="Rover"
                        >
                            <MenuItem value="" disabled>
                                Rover
                            </MenuItem>
                            <MenuItem key={uuidv4()} value="curiosity">Curiosity</MenuItem>
                            <MenuItem key={uuidv4()} value="opportunity">Opportunity</MenuItem>
                            <MenuItem key={uuidv4()} value="spirit">Spirit</MenuItem>
                        </Select>
                        <FormHelperText>Required</FormHelperText>
                    </FormControl>
                    <TextField
                        required
                        disabled={manifest ? false : true}
                        id="sol-input"
                        label="Sol"
                        type="number"
                        onChange={onSolChange}
                        onBlur={getNewSol}
                        helperText={`Max sol is ${manifest ? manifest.max_sol : 0}`}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="outlined"
                    />
                    <FormControl variant="outlined" required className="select-form">
                        <InputLabel id="camera-select-label">Camera</InputLabel>
                        <Select
                            labelId="camera-select-label"
                            id="camera-select"
                            value={camera}
                            onChange={onCameraChange}
                            label="Camera"
                        >
                            <MenuItem value="" disabled>
                                Camera
                            </MenuItem>
                            {
                                sol ? sol.cameras.map((cam) => <MenuItem key={uuidv4()} value={cam.toLowerCase()}>{cam}</MenuItem>) : null
                            }
                        </Select>
                        <FormHelperText>Required</FormHelperText>
                    </FormControl>
                </div>
                <div className="input-section-btn">
                    <Button className="btn" variant="outlined" type="submit">
                        Go
                    </Button>
                </div>
            </form>
            {
                error ? <ErrorIndicator/> : renderPhotos() 
            }
            <ScrollToTop showUnder={160}>
                <ArrowUpwardTwoToneIcon />
            </ScrollToTop>
        </div>
    );
    
}

export default PhotoList;