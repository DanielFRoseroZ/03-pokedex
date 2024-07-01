import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/pooke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    // Delete all data from the collection pokemon
    await this.pokemonModel.deleteMany({});

    // Get the data from the pokeapi
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650')

    // Prepare the data to insert
    const pokemonToInsert: {name: string, no: number}[] = [];

    // Iterate over the results and prepare the data to insert
    data.results.forEach(async ({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      pokemonToInsert.push({ no, name });
    })
    
    await this.pokemonModel.insertMany(pokemonToInsert);

    return 'Seed executed successfully!';
  }
}
