// DOCUMENTED 
/**
 * A simple rete component that returns the same output as the input.
 * @category Utility
 */

import {
    MagickComponent,
    MagickNode,
    MagickWorkerInputs,
    MagickWorkerOutputs,
    ModuleContext,
    stringSocket,
    triggerSocket,
    WorkerData
} from '@magickml/core';
import Rete from 'rete';

async function discord_list_channels(context: ModuleContext): Promise<any> {
    const { agent } = context.module;
    if (!agent) {
        return "Agent not found"
    }
    let result = ''
    //@ts-ignore
    //Get the Guild ID
    let id = agent?.discord.guildId.id
    //@ts-ignore
    //Using the Guild ID
    const guild = await agent?.discord.client.guilds.fetch(id);
    // Fetch all channels in the guild and handle any errors
    const channels = await guild.channels.fetch().catch(console.error);
    // Check if channels is empty or not
    if (channels.size === 0) {
        console.log("No channels found!");
    } else {
        // Loop through the channels and do something with them
        const textChannels = channels.filter(channel => channel.type === 2);
        const textChannelNames = textChannels.map(channel => channel.name);
        result = '``` Voice Channels\n';
        textChannelNames.forEach(channel => {
            result += `#${channel}\n`;
        });
        result += '```';
    }
    return result;
}


/**
 * The return type of the worker function.
 */
type WorkerReturn = {
    output: Record<string, any>;
}

/**
 * Returns the same output as the input.
 * @category Utility
 * @remarks This component is useful for testing purposes.
 */
export class DiscordListVoiceChannels extends MagickComponent<Promise<WorkerReturn>> {

    constructor() {
        super('Discord Voice Channels', {
            outputs: {
                output: 'output',
                trigger: 'option',
            },
        }, 'Discord', 'Gets the List of All voice channels in a server');
    }

    /**
     * The builder function for the Echo node.
     * @param node - The node being built.
     * @returns The node with its inputs and outputs.
     */
    builder(node: MagickNode) {
        const dataInput = new Rete.Input('trigger', 'Trigger', triggerSocket, true);
        const dataOutput = new Rete.Output('trigger', 'Trigger', triggerSocket);
        const outp = new Rete.Output('output', 'String', stringSocket);

        return node
            .addInput(dataInput)
            .addOutput(dataOutput)
            .addOutput(outp);
    }

    /**
     * The worker function for the Echo node.
     * @param node - The node being worked on.
     * @param inputs - The inputs of the node.
     * @param _outputs - The unused outputs of the node.
     * @returns An object containing the same string as the input.
     */
    async worker(
        node: WorkerData,
        inputs: MagickWorkerInputs,
        _outputs: MagickWorkerOutputs,
        context: ModuleContext,
    ): Promise<WorkerReturn> {

        const tool_desc = {
            title: 'Discord List Channels',
            body: 'Gets the list of all the voice channels also known as vc in the server and only the voice channels',
            id: node.id,
            action: discord_list_channels.toString(),
            function_name: 'discord_list_channels',
            keyword: 'Discord voice channels',
        }

        return {
            output: tool_desc
        }
    }
}